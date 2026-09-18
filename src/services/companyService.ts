import { Company } from '../types';
import { db } from './db/database';

export class CompanyService {
  /**
   * Get all registered companies
   */
  public getCompanies(): Company[] {
    return db.getCompanies();
  }

  /**
   * Get company by unique ID
   */
  public getCompanyById(id: string): Company | undefined {
    return db.getCompanies().find((c) => c.id === id);
  }

  /**
   * Create a new company with assigned ID (e.g. COMP-005)
   */
  public createCompany(data: {
    name: string;
    taxNumber?: string;
    city?: string;
    address?: string;
    phone?: string;
    email?: string;
  }): Company {
    const companies = db.getCompanies();
    const nextNum = companies.length + 1;
    const newId = `COMP-${nextNum.toString().padStart(3, '0')}`;

    const newCompany: Company = {
      id: newId,
      name: data.name.trim(),
      taxNumber: data.taxNumber?.trim(),
      city: data.city?.trim() || 'Kayseri',
      address: data.address?.trim() || '',
      phone: data.phone?.trim() || '',
      email: data.email?.trim() || '',
      employeeIds: [],
      createdAt: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    };

    const updated = [newCompany, ...companies];
    db.saveCompanies(updated);
    return newCompany;
  }

  /**
   * Link an employee to a company.
   * STRICT 1-N RULE:
   * Each company can have multiple employees.
   * However, an employee can belong to ONLY ONE company. If employee was in another company, removes from old company.
   */
  public assignEmployeeToCompany(companyId: string, employeeId: string): void {
    const companies = db.getCompanies();
    const updated = companies.map((c) => {
      // Remove from any other company
      const cleanedEmployees = c.employeeIds.filter((id) => id !== employeeId);

      // If target company, add employee
      if (c.id === companyId) {
        return {
          ...c,
          employeeIds: [...cleanedEmployees, employeeId],
        };
      }
      return {
        ...c,
        employeeIds: cleanedEmployees,
      };
    });

    db.saveCompanies(updated);
  }

  /**
   * Remove employee from company
   */
  public removeEmployee(employeeId: string): void {
    const companies = db.getCompanies();
    const updated = companies.map((c) => ({
      ...c,
      employeeIds: c.employeeIds.filter((id) => id !== employeeId),
    }));
    db.saveCompanies(updated);
  }
}

export const companyService = new CompanyService();
