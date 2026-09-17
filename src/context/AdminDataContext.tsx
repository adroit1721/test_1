import React from 'react';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';
import { CadetRosterProvider, useCadetRoster } from './CadetRosterContext';
import { RecruitmentProvider, useRecruitment } from './RecruitmentContext';
import { SiteContentProvider, useSiteContent } from './SiteContentContext';

export { useAdminAuth } from './AdminAuthContext';
export { useCadetRoster } from './CadetRosterContext';
export { useRecruitment } from './RecruitmentContext';
export { useSiteContent } from './SiteContentContext';

export {
  DEFAULT_PRINCIPAL_MESSAGE,
  DEFAULT_VICE_PRINCIPAL_MESSAGE,
  DEFAULT_ABOUT_OVERVIEW,
  DEFAULT_HEADER_LEFT_LOGO_URL,
  DEFAULT_HEADER_RIGHT_LOGO_URL,
  DEFAULT_HEADER_TITLE,
  DEFAULT_HEADER_SUBTITLE,
  DEFAULT_SITE_FAVICON,
} from './SiteContentContext';

export {
  DEFAULT_RECRUITMENT_ANNOUNCEMENT,
  DEFAULT_RECRUITMENT_SIGNATORIES,
} from './RecruitmentContext';

export { isSampleCadet } from './CadetRosterContext';

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AdminAuthProvider>
      <CadetRosterProvider>
        <RecruitmentProvider>
          <SiteContentProvider>{children}</SiteContentProvider>
        </RecruitmentProvider>
      </CadetRosterProvider>
    </AdminAuthProvider>
  );
};

export const useAdminData = () => {
  const auth = useAdminAuth();
  const roster = useCadetRoster();
  const recruitment = useRecruitment();
  const content = useSiteContent();

  return {
    ...auth,
    ...roster,
    ...recruitment,
    ...content,

    // Aliases & fallback helpers for full backward compatibility
    customFormTitle: 'Training Application',
    customFormDescription: 'Submit training registration form',
    customFormFields: content.trainingFormFields,
    addCustomSubmission: content.addTrainingSubmission,
    addCadetAccount: roster.addCadetUser,
    resetAllToDefault: () => {},
  };
};
