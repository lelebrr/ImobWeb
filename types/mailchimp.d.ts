/**
 * Type declarations for Mailchimp SDKs to ensure build stability 
 * even when standard @types packages are missing or conflicting.
 */

declare module '@mailchimp/mailchimp_marketing' {
  const mailchimp: any;
  export default mailchimp;
}

declare module '@mailchimp/mailchimp_transactional' {
  const transactional: any;
  export default transactional;
}
