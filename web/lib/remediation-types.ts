export type VerifyResult = {
  verified: boolean;
  verifyScanId?: string | null;
  beforeStatus?: string;
  afterStatus?: string;
  reason?: string;
};
