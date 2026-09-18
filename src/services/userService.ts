import { Customer } from '../types';
import { db } from './db/database';
import { companyService } from './companyService';

export class UserService {
  /**
   * Get all registered users/customers
   */
  public getUsers(): Customer[] {
    return db.getUsers();
  }

  /**
   * Get user by ID
   */
  public getUserById(id: string): Customer | undefined {
    return db.getUsers().find((u) => u.id === id);
  }

  /**
   * ADMIN LOGIN:
   * STRICT RULE:
   * Only Batu Güdek is authorized to log in via the Admin Login entrance!
   * Any other input results in an explicit error.
   */
  public adminLogin(identifier: string, password: string): { success: boolean; user?: Customer; error?: string } {
    const cleanId = identifier.trim().toLowerCase();

    const isBatuGudek =
      cleanId === 'batugudek' ||
      cleanId === 'batu gudek' ||
      cleanId === 'batugudek1@gmail.com' ||
      cleanId === 'batu.gudek@gmail.com';

    if (!isBatuGudek) {
      return {
        success: false,
        error: 'Yetkisiz Giriş: Bu alandan yalnızca yetkili sistem yöneticisi (Batu Güdek) giriş yapabilir! Yetkisiz giriş denemesi engellendi.',
      };
    }

    // Check admin in database
    const users = db.getUsers();
    let adminUser = users.find(
      (u) =>
        u.username.toLowerCase() === 'batugudek' ||
        u.email.toLowerCase() === 'batugudek1@gmail.com' ||
        u.email.toLowerCase() === 'batu.gudek@gmail.com'
    );

    if (!adminUser) {
      // Create admin record if not present
      adminUser = {
        id: 'cust-1',
        firstName: 'Batu',
        lastName: 'Güdek',
        email: 'batugudek1@gmail.com',
        phone: '+90 (532) 450 12 34',
        username: 'batugudek',
        password: 'Password123*',
        companyId: 'COMP-001',
        companyName: 'Moda Vizyon Butik Ltd. Şti.',
        role: 'Admin',
        totalOrders: 6,
        totalSpent: 14850,
        status: 'Aktif',
        createdAt: '01.01.2026',
      };
      db.saveUsers([adminUser, ...users]);
    }

    // STRICT PASSWORD VERIFICATION FOR ADMIN
    const expectedAdminPassword = adminUser.password || 'Password123*';
    if (!password || password.trim() !== expectedAdminPassword.trim()) {
      return {
        success: false,
        error: 'Hatalı Yönetici Şifresi: Girdiğiniz şifre sistem yöneticisi (Batu Güdek) şifresi ile eşleşmiyor!',
      };
    }

    return {
      success: true,
      user: { ...adminUser, role: 'Admin' },
    };
  }

  /**
   * CUSTOMER / BAYI LOGIN:
   * Normal customers login with their username or email AND password
   */
  public customerLogin(identifier: string, password: string): { success: boolean; user?: Customer; error?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const users = db.getUsers();

    const matched = users.find(
      (u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    if (!matched) {
      return {
        success: false,
        error: 'Girdiğiniz kullanıcı adı veya e-posta adresi sistemde bulunamadı. Lütfen kontrol ediniz veya kayıt olunuz.',
      };
    }

    // STRICT PASSWORD VERIFICATION FOR CUSTOMER
    const expectedPassword = matched.password || 'Password123*';
    if (!password || password.trim() !== expectedPassword.trim()) {
      return {
        success: false,
        error: 'Hatalı Şifre: Girdiğiniz şifre kullanıcı bilgileriyle eşleşmiyor. Lütfen bilgilerinizi kontrol ediniz.',
      };
    }

    if (matched.status === 'Pasif') {
      return {
        success: false,
        error: 'Hesabınız pasif durumdadır. Lütfen sistem yöneticisi ile iletişime geçiniz.',
      };
    }

    return {
      success: true,
      user: matched,
    };
  }

  /**
   * REGISTER NEW CUSTOMER WITH COMPANY ASSIGNMENT:
   * 1-N Rule:
   * Company can have multiple employees.
   * But this newly registered employee is linked to exactly 1 company!
   */
  public registerCustomer(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    username: string;
    password?: string;
    companyId: string;
    companyName: string;
    city?: string;
    address?: string;
  }): { success: boolean; user?: Customer; error?: string } {
    const users = db.getUsers();

    // Check unique email & username
    if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
      return { success: false, error: 'Bu e-posta adresi ile zaten kayıtlı bir hesap bulunmaktadır.' };
    }
    if (users.some((u) => u.username.toLowerCase() === data.username.trim().toLowerCase())) {
      return { success: false, error: 'Bu kullanıcı adı zaten kullanılmaktadır. Lütfen farklı bir kullanıcı adı seçiniz.' };
    }

    const nextId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: Customer = {
      id: nextId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      username: data.username.trim(),
      password: data.password ? data.password : 'Password123*',
      city: data.city || 'Kayseri',
      address: data.address || '',
      companyId: data.companyId, // TEK BİR ŞİRKETE BAĞLI
      companyName: data.companyName,
      role: 'Customer',
      totalOrders: 0,
      totalSpent: 0,
      status: 'Aktif',
      createdAt: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    };

    // Save user
    const updatedUsers = [newUser, ...users];
    db.saveUsers(updatedUsers);

    // Link in company service (1 Company -> N Employees)
    companyService.assignEmployeeToCompany(data.companyId, newUser.id);

    return { success: true, user: newUser };
  }

  /**
   * Delete user
   */
  public deleteUser(id: string): void {
    const users = db.getUsers().filter((u) => u.id !== id);
    db.saveUsers(users);
    companyService.removeEmployee(id);
  }

  /**
   * Update user details
   */
  public updateUser(user: Customer): void {
    const users = db.getUsers().map((u) => (u.id === user.id ? user : u));
    db.saveUsers(users);
    if (user.companyId) {
      companyService.assignEmployeeToCompany(user.companyId, user.id);
    }
  }
}

export const userService = new UserService();
