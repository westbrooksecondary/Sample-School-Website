(function () {
    var directory = document.getElementById("staff-directory");
    var status = document.getElementById("staff-directory-status");
    var config = window.staffPortalConfig;

    if (!directory || !config || !window.supabase ||
        config.supabaseUrl.indexOf("YOUR_") === 0 ||
        config.supabaseAnonKey.indexOf("YOUR_") === 0) {
        return;
    }

    var client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);

    function makeCard(member) {
        var column = document.createElement("div");
        var card = document.createElement("div");
        var imageBox = document.createElement("div");
        var image = document.createElement("img");
        var content = document.createElement("div");
        var name = document.createElement("h3");
        var title = document.createElement("p");

        column.className = "col-md-3 col-sm-6 col-xs-12 team-column";
        card.className = "single-item";
        imageBox.className = "img-box";
        content.className = "lower-content";
        image.src = member.photo_url || "images/team/1.jpg";
        image.alt = member.full_name;
        image.loading = "lazy";
        image.onerror = function () {
            image.onerror = null;
            image.src = "images/team/1.jpg";
        };
        name.textContent = member.full_name;
        title.textContent = member.title;
        imageBox.appendChild(image);
        content.appendChild(name);
        content.appendChild(title);
        card.appendChild(imageBox);
        card.appendChild(content);
        column.appendChild(card);

        return column;
    }

    client.from("staff_directory")
        .select("id, full_name, title, photo_url, display_order")
        .order("display_order", { ascending: true })
        .order("full_name", { ascending: true })
        .then(function (result) {
            if (result.error) {
                status.textContent = "The staff directory could not be refreshed. Showing the saved directory instead.";
                return;
            }

            directory.replaceChildren();
            result.data.forEach(function (member) {
                directory.appendChild(makeCard(member));
            });
            if (!result.data.length) {
                status.textContent = "No staff members have been added yet.";
            }
        });
}());