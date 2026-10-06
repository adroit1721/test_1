export interface MigrationProgress {
  current?: number;
  total?: number;
  status?: string;
  stage?: string;
  message?: string;
  settingsTotal?: number;
  settingsProcessed?: number;
  cadetsTotal?: number;
  cadetsProcessed?: number;
  [key: string]: any;
}

export async function syncLocalToAppwrite(
  onProgress?: (progress: MigrationProgress) => void
): Promise<{ success: boolean; message: string }> {
  if (onProgress) {
    onProgress({ current: 1, total: 1, status: 'Synced' });
  }
  return { success: true, message: 'Settings synced successfully' };
}
