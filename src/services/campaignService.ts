import { CampaignSlide } from '../types';
import { db } from './db/database';

export class CampaignService {
  /**
   * Get all campaigns/slider ads
   */
  public getCampaigns(): CampaignSlide[] {
    return db.getCampaigns();
  }

  /**
   * Get active campaigns for homepage slider
   */
  public getActiveCampaigns(): CampaignSlide[] {
    return db.getCampaigns().filter((c) => c.isActive !== false);
  }

  /**
   * Add new campaign/advertisement
   */
  public addCampaign(campaign: Omit<CampaignSlide, 'id'>): CampaignSlide {
    const campaigns = db.getCampaigns();
    const newSlide: CampaignSlide = {
      ...campaign,
      id: `camp-${Date.now()}`,
      isActive: campaign.isActive !== undefined ? campaign.isActive : true,
    };
    const updated = [newSlide, ...campaigns];
    db.saveCampaigns(updated);
    return newSlide;
  }

  /**
   * Update existing campaign
   */
  public updateCampaign(campaign: CampaignSlide): void {
    const campaigns = db.getCampaigns().map((c) => (c.id === campaign.id ? campaign : c));
    db.saveCampaigns(campaigns);
  }

  /**
   * Delete campaign
   */
  public deleteCampaign(id: string): void {
    const campaigns = db.getCampaigns().filter((c) => c.id !== id);
    db.saveCampaigns(campaigns);
  }

  /**
   * Toggle active state
   */
  public toggleCampaign(id: string): void {
    const campaigns = db.getCampaigns().map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    db.saveCampaigns(campaigns);
  }
}

export const campaignService = new CampaignService();
