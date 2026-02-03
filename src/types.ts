
export enum HealthCondition {
  RECENT_SURGERY = "เพิ่งเข้ารับการผ่าตัด (เช่น ข้อสะโพก/เข่า)",
  DIABETES = "เบาหวาน",
  HYPERTENSION = "ความดันโลหิตสูง",
  ARTHRITIS = "ข้ออักเสบ/ปวดข้อ",
  STROKE = "อัมพฤกษ์/อัมพาต",
  PARKINSONS = "พาร์กินสัน",
  VERTIGO = "เวียนศีรษะ/บ้านหมุน",
  VISION_IMPAIRMENT = "สายตามีปัญหา",
  NONE = "ไม่มีโรคประจำตัว"
}

export enum MobilityLevel {
  INDEPENDENT = "เดินได้เองมั่นคง",
  UNSTEADY = "เดินได้แต่ไม่มั่นคง",
  NEED_SUPPORT = "ต้องมีคนพยุงหรือเกาะผนัง",
  CANNOT_WALK = "เดินไม่ได้"
}

export enum Gender {
  MALE = "ชาย",
  FEMALE = "หญิง",
  NOT_SPECIFIED = "ไม่ระบุ"
}

export interface UserProfile {
  name: string;
  age: number;
  weight?: number;
  height?: number;
  gender?: Gender;
  conditions?: HealthCondition[];
  isSelf: boolean;
  lineId?: string;
  phoneNumber?: string; // Added for manual registration
}

export interface AssessmentData {
  mobilityLevel: MobilityLevel;
  sitToStand: 'independent' | 'one_hand' | 'two_hands' | 'unable'; // การลุกยืน
  upperBodyStrength: 'strong' | 'moderate' | 'weak'; // ความแข็งแรงแขน
  weightBearing: 'full' | 'partial' | 'none'; // การลงน้ำหนัก
  primaryEnvironment: 'indoor' | 'outdoor' | 'both';
  budgetRange: 'low' | 'medium' | 'high';
}

export interface DeviceRecommendation {
  id: string;
  name: string;
  category: string;
  description: string;
  reason: string;
  tutorialVideoId: string;
  approxPrice: number;
  qualityRating: number; // 1-5
  purchaseLinks: { vendor: string; url: string; price: number }[];
}

export type AppState = 'LOGIN' | 'LOGIN_MANUAL' | 'REGISTER' | 'COMPLETE_BASIC_INFO' | 'PROFILE_SELECTION' | 'COMPLETE_HEALTH_INFO' | 'CREATE_PROFILE' | 'ASSESSMENT' | 'RESULTS' | 'CHAT';
