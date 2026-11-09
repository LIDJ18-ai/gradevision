export type GradeStatus = 'pending' | 'analyzing' | 'complete';

export interface CenteringData {
  top: number;
  bottom: number;
  left: number;
  right: number;
  horizontalRatio: string;
  verticalRatio: string;
}

export interface CornerData {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
  defects: string[];
}

export interface EdgeData {
  top: number;
  bottom: number;
  left: number;
  right: number;
  wearLevel: string;
  defects: string[];
}

export interface SurfaceData {
  scratches: number;
  printDefects: number;
  whitening: number;
  overall: string;
  defects: string[];
}

export interface GradingReport {
  id: string;
  user_id: string;
  card_name: string;
  card_set: string | null;
  card_year: string | null;
  front_image_url: string;
  back_image_url: string | null;
  closeup_image_url: string | null;
  status: GradeStatus;
  is_demo: boolean;
  overall_grade: number | null;
  centering_grade: number | null;
  corners_grade: number | null;
  edges_grade: number | null;
  surface_grade: number | null;
  centering_data: CenteringData | null;
  corners_data: CornerData | null;
  edges_data: EdgeData | null;
  surface_data: SurfaceData | null;
  summary: string | null;
  created_at: string;
}

export interface GradingReportInput {
  card_name: string;
  card_set?: string | null;
  card_year?: string | null;
  front_image_url: string;
  back_image_url?: string | null;
  closeup_image_url?: string | null;
  status?: GradeStatus;
  is_demo?: boolean;
  overall_grade?: number | null;
  centering_grade?: number | null;
  corners_grade?: number | null;
  edges_grade?: number | null;
  surface_grade?: number | null;
  centering_data?: CenteringData | null;
  corners_data?: CornerData | null;
  edges_data?: EdgeData | null;
  surface_data?: SurfaceData | null;
  summary?: string | null;
}

export interface GradeResult {
  overall: number;
  centering: number;
  corners: number;
  edges: number;
  surface: number;
  centeringData: CenteringData;
  cornersData: CornerData;
  edgesData: EdgeData;
  surfaceData: SurfaceData;
  summary: string;
}

export type Page = 'home' | 'login' | 'signup' | 'upload' | 'analyzing' | 'report' | 'dashboard';

export interface AppUser {
  id: string;
  email: string;
}
