# Staff Portal Setup

The website is hosted on GitHub Pages. Authentication and staff records use Supabase; a static GitHub Pages site cannot securely store credentials or edit records by itself.

1. Create a Supabase project.
2. Open its SQL Editor and run `supabase-schema.sql`.
3. In Supabase Authentication, add and confirm a user for `nathangreenhalgh260@gmail.com`. Set a unique password with at least 12 characters in the dashboard. Do not use `Luke*`; it is short and must not be committed to the repository.
4. Disable public sign-ups in Supabase Authentication settings.
5. Copy the Supabase project URL and public anon/publishable key from Project API settings. Put them in `js/supabase-config.js`, replacing the `YOUR_...` placeholders. Never use the `service_role` key.
6. Set the minimum password length to at least 12 in Supabase Authentication settings.
7. Deploy the config update. Sign in at `staff-portal.html` with username `Luke` and the password created in step 3. Successful sign-in redirects to `staff-admin.html`; opening that page without an authorized session returns to the login page.

The SQL enables public reads so the school directory can be displayed on the site. Row-level security allows inserts, updates, and deletes only for the configured admin email. The seed records mirror the existing sample directory; update or remove them in the portal after setup.