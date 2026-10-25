(function () {
    var config = window.staffPortalConfig;
    var status = document.getElementById("portal-status");
    var loginForm = document.getElementById("portal-login-form");
    var loginButton = document.getElementById("portal-login-button");

    function setStatus(message, isError) {
        status.textContent = message;
        status.classList.toggle("is-error", Boolean(isError));
    }

    function isConfigured() {
        return config && window.supabase &&
            config.supabaseUrl.indexOf("YOUR_") !== 0 &&
            config.supabaseAnonKey.indexOf("YOUR_") !== 0;
    }

    if (!isConfigured()) {
        setStatus("Portal setup required. Add the Supabase project URL and public key in js/supabase-config.js, then run supabase-schema.sql in Supabase.", true);
        loginButton.disabled = true;
        return;
    }

    var client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);

    async function continueIfAuthorized(session) {
        if (!session) {
            return;
        }

        var email = session.user.email || "";
        if (email.toLowerCase() === config.adminEmail.toLowerCase()) {
            window.location.replace("staff-admin.html");
            return;
        }

        await client.auth.signOut();
        setStatus("This account is not authorized to manage staff.", true);
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        var username = loginForm.elements.username.value.trim().toLowerCase();
        var password = loginForm.elements.password.value;

        if (username !== config.adminUsername.toLowerCase()) {
            setStatus("Invalid username or password.", true);
            return;
        }

        loginButton.disabled = true;
        setStatus("Signing in...", false);
        try {
            var result = await client.auth.signInWithPassword({
                email: config.adminEmail,
                password: password
            });

            if (result.error || !result.data.user) {
                setStatus("Invalid username or password.", true);
                loginButton.disabled = false;
                return;
            }

            await continueIfAuthorized({ user: result.data.user });
        } catch (error) {
            setStatus("Could not connect to the authentication service.", true);
            loginButton.disabled = false;
        }
    });

    client.auth.getSession().then(function (result) {
        if (result.data.session) {
            continueIfAuthorized(result.data.session);
        }
    });
}());