import { ClientRequest, Company, Offer, Contract, Inspector, ProjectStage, Notification, ProjectCommission, PromoCode, WarrantyRecord, WarrantyComplaint, AuditLog } from './types';

export const initialRequests: ClientRequest[] = [];

export const initialCompanies: Company[] = [];

export const initialOffers: Offer[] = [];

export const initialContracts: Contract[] = [];

export const initialInspectors: Inspector[] = [
  {
    id: 'INS-KHALED',
    name: 'المهندس خالد عبد الرحمن',
    governorate: 'القاهرة',
    zone: 'التجمع الخامس',
    activeProjectsCount: 1,
    phone: '01002233445',
    status: 'ACTIVE',
    password: '12345678',
    stagesSpecialties: ['السباكة', 'الكهرباء', 'المحارة', 'الدهانات', 'الأرضيات'],
    responseSpeedRating: 4.9,
    reportAccuracyRating: 4.8,
    totalEvaluationsCount: 14
  },
  {
    id: 'INS-1',
    name: 'المهندس أحمد مصطفى',
    governorate: 'القاهرة',
    zone: 'مصر الجديدة',
    activeProjectsCount: 2,
    phone: '01001234567',
    status: 'ACTIVE',
    password: '12345678',
    stagesSpecialties: ['السباكة', 'الكهرباء', 'المحارة'],
    responseSpeedRating: 4.8,
    reportAccuracyRating: 4.9,
    totalEvaluationsCount: 25
  },
  {
    id: 'INS-2',
    name: 'المهندس محمد الشافعي',
    governorate: 'الجيزة',
    zone: 'الدقي',
    activeProjectsCount: 1,
    phone: '01112345678',
    status: 'ACTIVE',
    password: '12345678',
    stagesSpecialties: ['الدهانات', 'الأرضيات', 'الديكور'],
    responseSpeedRating: 4.7,
    reportAccuracyRating: 4.6,
    totalEvaluationsCount: 19
  }
];

export const initialProjectStages: ProjectStage[] = [];

export const initialWarrantyRecords: WarrantyRecord[] = [];

export const initialWarrantyComplaints: WarrantyComplaint[] = [];

export const initialAuditLogs: AuditLog[] = [];

export const initialNotifications: Notification[] = [];

export const initialCommissions: ProjectCommission[] = [];

export const initialPromoCodes: PromoCode[] = [];

