(function () {
    var config = window.staffPortalConfig;
    var status = document.getElementById("portal-status");
    var managerPanel = document.getElementById("portal-manager-panel");
    var recordForm = document.getElementById("staff-record-form");
    var recordList = document.getElementById("staff-record-list");
    var saveButton = document.getElementById("staff-save-button");
    var cancelButton = document.getElementById("staff-cancel-button");
    var editingId = "";

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
        setStatus("Portal setup required. Configure Supabase before managing staff.", true);
        return;
    }

    var client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);

    function resetRecordForm() {
        editingId = "";
        recordForm.reset();
        document.getElementById("staff-record-id").value = "";
        document.getElementById("staff-sort-order").value = "0";
        saveButton.textContent = "Add staff member";
        cancelButton.hidden = true;
    }

    function addCell(row, value) {
        var cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
        return cell;
    }

    function editMember(member) {
        editingId = member.id;
        document.getElementById("staff-full-name").value = member.full_name;
        document.getElementById("staff-title").value = member.title;
        document.getElementById("staff-photo-url").value = member.photo_url || "";
        document.getElementById("staff-sort-order").value = member.display_order;
        saveButton.textContent = "Save changes";
        cancelButton.hidden = false;
        document.getElementById("staff-full-name").focus();
    }

    function renderStaff(members) {
        recordList.replaceChildren();
        members.forEach(function (member) {
            var row = document.createElement("tr");
            var actions = document.createElement("td");
            var editButton = document.createElement("button");
            var deleteButton = document.createElement("button");

            addCell(row, member.full_name);
            addCell(row, member.title);
            addCell(row, String(member.display_order));
            editButton.type = "button";
            editButton.className = "staff-action-button";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", function () { editMember(member); });
            deleteButton.type = "button";
            deleteButton.className = "staff-action-button staff-delete-button";
            deleteButton.textContent = "Remove";
            deleteButton.addEventListener("click", function () { removeMember(member); });
            actions.appendChild(editButton);
            actions.appendChild(deleteButton);
            row.appendChild(actions);
            recordList.appendChild(row);
        });
    }

    async function loadStaff() {
        setStatus("Loading staff directory...", false);
        try {
            var result = await client.from("staff_directory")
                .select("id, full_name, title, photo_url, display_order")
                .order("display_order", { ascending: true })
                .order("full_name", { ascending: true });

            if (result.error) {
                setStatus("Could not load staff records. Check the Supabase database setup.", true);
                return;
            }

            renderStaff(result.data);
            setStatus(result.data.length + " staff members", false);
        } catch (error) {
            setStatus("Could not connect to the staff database.", true);
        }
    }

    async function removeMember(member) {
        if (!window.confirm("Remove " + member.full_name + " from the staff directory?")) {
            return;
        }

        var result = await client.from("staff_directory").delete().eq("id", member.id);
        if (result.error) {
            setStatus("Could not remove this staff member.", true);
            return;
        }

        if (editingId === member.id) {
            resetRecordForm();
        }
        setStatus("Staff member removed.", false);
        loadStaff();
    }

    document.getElementById("portal-logout-button").addEventListener("click", async function () {
        await client.auth.signOut();
        window.location.replace("staff-portal.html");
    });

    cancelButton.addEventListener("click", resetRecordForm);

    recordForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        var record = {
            full_name: recordForm.elements.full_name.value.trim(),
            title: recordForm.elements.title.value.trim(),
            photo_url: recordForm.elements.photo_url.value.trim() || null,
            display_order: Number(recordForm.elements.display_order.value) || 0
        };
        var result = editingId
            ? await client.from("staff_directory").update(record).eq("id", editingId)
            : await client.from("staff_directory").insert(record);

        if (result.error) {
            setStatus("Could not save staff details. Check the entered values and database policies.", true);
            return;
        }

        resetRecordForm();
        setStatus("Staff details saved.", false);
        loadStaff();
    });

    client.auth.getSession().then(async function (result) {
        var session = result.data.session;
        var email = session && session.user.email || "";

        if (!session || email.toLowerCase() !== config.adminEmail.toLowerCase()) {
            if (session) {
                await client.auth.signOut();
            }
            window.location.replace("staff-portal.html");
            return;
        }

        managerPanel.hidden = false;
        loadStaff();
    });
}());