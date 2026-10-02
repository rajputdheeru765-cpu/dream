/* =========================================
   DHEERAJ PERSONAL WEBSITE - FULL JS
   ========================================= */

const STORAGE = {
    profile: "dheeraj_profile_v2",
    goals: "dheeraj_goals_v2",
    gallery: "dheeraj_gallery_v2",
    projects: "dheeraj_projects_v2",
    contact: "dheeraj_contact_v2",
    about: "dheeraj_about_v2"
};

/* ================= SUPABASE CLOUD SYNC ================= */
const SUPABASE_URL = "https://odlxhvtnknxlbzkygfmq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2vdkATOTwUk10oa2xBu6hg_7jVz04e2";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
let cloudReady = false;
let currentUser = null;
let authMode = "login";

const defaultProfile = {
    name: "Dheeraj Koranga",
    bio: "Turning ideas into reality, one step at a time.",
    photo: ""
};

const defaultProjects = [
    {name:"AI Chatbox", desc:"Smart AI chatbot with voice, images and more.", url:"", icon:"🤖"},
    {name:"3D Space Website", desc:"Explore the universe in 3D.", url:"", icon:"🪐"},
    {name:"Portfolio Website", desc:"My personal portfolio and achievements.", url:"", icon:"💻"}
];

const defaultContact = {
    email:"yourmail@gmail.com",
    instagram:"",
    github:"",
    linkedin:"",
    other:""
};

let profile = load(STORAGE.profile, defaultProfile);
let goals = load(STORAGE.goals, []);
let gallery = load(STORAGE.gallery, []);
let projects = load(STORAGE.projects, defaultProjects);
let contact = load(STORAGE.contact, defaultContact);
let aboutText = load(STORAGE.about,
    "I am a BCA student, learning web development, AI and new technologies. This website is my personal space to keep track of my dreams, memories, projects and everything I want to achieve in life."
);

function load(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        return fallback;
    }
}

function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    if (cloudReady) scheduleCloudSave();
}

/* CLOCK */
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    document.getElementById("clock").textContent =
        String(hours).padStart(2, "0") + ":" + minutes + " " + ampm;

    document.getElementById("date").textContent =
        now.toLocaleDateString("en-US", {
            weekday:"long", day:"numeric", month:"long", year:"numeric"
        });
}
setInterval(updateClock, 1000);
updateClock();

/* NAVIGATION */
function scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({behavior:"smooth", block:"start"});
}

document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
        button.classList.add("active");
    });
});

/* THEME + NOTIFICATION */
function toggleTheme() {
    document.body.classList.toggle("light");
    localStorage.setItem("dheeraj_theme",
        document.body.classList.contains("light") ? "light" : "dark");
}

if (localStorage.getItem("dheeraj_theme") === "light") {
    document.body.classList.add("light");
}

function showNotification() {
    alert("🔔 Welcome Dheeraj!\n\nKeep working on your dreams. 🚀");
}

/* PROFILE */
function editProfile() {
    document.getElementById("editName").value = profile.name;
    document.getElementById("editBio").value = profile.bio;
    document.getElementById("profilePhotoInput").value = "";
    openModal("profileModal");
}

function saveProfile() {
    const name = document.getElementById("editName").value.trim();
    const bio = document.getElementById("editBio").value.trim();
    const input = document.getElementById("profilePhotoInput");

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    profile.name = name;
    profile.bio = bio || "Welcome to my personal space.";

    if (input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            profile.photo = e.target.result;
            save(STORAGE.profile, profile);
            renderProfile();
            closeModal("profileModal");
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        save(STORAGE.profile, profile);
        renderProfile();
        closeModal("profileModal");
    }
}

function renderProfile() {
    document.getElementById("profileName").textContent = profile.name;
    document.getElementById("heroName").textContent = profile.name + " 👋";
    document.getElementById("footerName").textContent = profile.name;
    document.getElementById("profileBio").textContent = profile.bio;

    const image = document.getElementById("profileImage");
    const emoji = document.getElementById("profileEmoji");
    const topAvatar = document.getElementById("topAvatar");

    if (profile.photo) {
        image.src = profile.photo;
        image.style.display = "block";
        emoji.style.display = "none";
        topAvatar.innerHTML = `<img src="${profile.photo}" alt="Profile">`;
    } else {
        image.style.display = "none";
        emoji.style.display = "block";
        topAvatar.textContent = "👤";
    }
}

/* ABOUT */
function editAbout() {
    const text = prompt("Write something about yourself:", aboutText);
    if (text && text.trim()) {
        aboutText = text.trim();
        save(STORAGE.about, aboutText);
        document.getElementById("aboutText").textContent = aboutText;
    }
}

/* GOALS */
function addGoal() {
    const goal = prompt("🎯 Enter your new goal:");
    if (!goal || !goal.trim()) return;

    goals.push({text:goal.trim(), completed:false});
    save(STORAGE.goals, goals);
    renderGoals();
}

function renderGoals() {
    const list = document.getElementById("goalList");
    list.innerHTML = "";

    if (!goals.length) {
        list.innerHTML = `
            <div class="empty-goal">
                <span>⊕</span>
                <h3>Add your first goal</h3>
                <p>Start your journey today</p>
            </div>`;
        updateStats();
        return;
    }

    goals.forEach((goal, index) => {
        const div = document.createElement("div");
        div.className = "goal-item " + (goal.completed ? "completed" : "");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = goal.completed;
        checkbox.onchange = () => completeGoal(index);

        const label = document.createElement("label");
        label.textContent = goal.text;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-goal";
        deleteBtn.textContent = "✕";
        deleteBtn.onclick = () => deleteGoal(index);

        div.append(checkbox, label, deleteBtn);
        list.appendChild(div);
    });

    updateStats();
}

function completeGoal(index) {
    goals[index].completed = !goals[index].completed;
    save(STORAGE.goals, goals);
    renderGoals();
}

function deleteGoal(index) {
    if (!confirm("Delete this goal?")) return;
    goals.splice(index, 1);
    save(STORAGE.goals, goals);
    renderGoals();
}

function updateStats() {
    const total = goals.length;
    const completed = goals.filter(g => g.completed).length;
    const remaining = total - completed;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    document.getElementById("totalGoals").textContent = total;
    document.getElementById("completedGoals").textContent = completed;
    document.getElementById("remainingGoals").textContent = remaining;
    document.getElementById("progress").textContent = percentage + "%";
}

/* GALLERY */
function addImage() {
    document.getElementById("imageInput").click();
}

document.getElementById("imageInput").addEventListener("change", function(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    let remaining = files.length;

    files.forEach(file => {
        if (!file.type.startsWith("image/")) {
            remaining--;
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            gallery.push({
                src:e.target.result,
                name:file.name
            });
            remaining--;

            if (remaining === 0) {
                save(STORAGE.gallery, gallery);
                renderGallery();
            }
        };
        reader.readAsDataURL(file);
    });

    event.target.value = "";
});

function renderGallery() {
    const grid = document.getElementById("galleryGrid");
    grid.innerHTML = "";

    gallery.forEach((item, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "gallery-image gallery-item";

        const img = document.createElement("img");
        img.src = item.src;
        img.alt = item.name || "Gallery photo";
        img.onclick = () => openImageViewer(item.src);

        const remove = document.createElement("button");
        remove.className = "gallery-delete";
        remove.textContent = "×";
        remove.title = "Delete photo";
        remove.onclick = event => {
            event.stopPropagation();
            if (confirm("Delete this photo?")) {
                gallery.splice(index, 1);
                save(STORAGE.gallery, gallery);
                renderGallery();
            }
        };

        wrapper.append(img, remove);
        grid.appendChild(wrapper);
    });

    const add = document.createElement("button");
    add.className = "add-more";
    add.onclick = addImage;
    add.innerHTML = "<span>＋</span><small>Add More</small>";
    grid.appendChild(add);
}

function openImageViewer(src) {
    document.getElementById("viewerImage").src = src;
    document.getElementById("imageViewer").classList.add("show");
    document.body.classList.add("no-scroll");
}

function closeImageViewer(event) {
    if (event && event.target && event.target.id === "viewerImage") return;
    document.getElementById("imageViewer").classList.remove("show");
    document.body.classList.remove("no-scroll");
}

/* PROJECTS */
function addProject() {
    document.getElementById("projectNameInput").value = "";
    document.getElementById("projectDescInput").value = "";
    document.getElementById("projectUrlInput").value = "";
    document.getElementById("projectIconInput").value = "💻";
    openModal("projectModal");
}

function saveProject() {
    const name = document.getElementById("projectNameInput").value.trim();
    const desc = document.getElementById("projectDescInput").value.trim();
    let url = document.getElementById("projectUrlInput").value.trim();
    const icon = document.getElementById("projectIconInput").value.trim() || "💻";

    if (!name) {
        alert("Please enter a project name.");
        return;
    }

    if (url && !/^https?:\/\//i.test(url)) {
        url = "https://" + url;
    }

    projects.push({
        name,
        desc:desc || "My personal project.",
        url,
        icon
    });

    save(STORAGE.projects, projects);
    renderProjects();
    closeModal("projectModal");
}

function renderProjects() {
    const grid = document.getElementById("projectGrid");
    grid.innerHTML = "";

    projects.forEach((project, index) => {
        const card = document.createElement("div");
        card.className = "project";

        const icon = document.createElement("div");
        icon.className = "project-icon";
        icon.textContent = project.icon || "💻";

        const title = document.createElement("h3");
        title.textContent = project.name;

        const desc = document.createElement("p");
        desc.textContent = project.desc || "My personal project.";

        const actions = document.createElement("div");
        actions.className = "project-actions";

        const view = document.createElement("button");
        view.textContent = project.url ? "View →" : "No URL";
        view.disabled = !project.url;
        view.onclick = () => openProject(project.url);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "project-delete";
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => {
            if (!confirm("Delete this project?")) return;
            projects.splice(index, 1);
            save(STORAGE.projects, projects);
            renderProjects();
        };

        actions.append(view, deleteBtn);
        card.append(icon, title, desc, actions);
        grid.appendChild(card);
    });
}

function openProject(url) {
    if (!url) {
        alert("Is project mein abhi URL add nahi hai.");
        return;
    }

    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    window.open(url, "_blank", "noopener,noreferrer");
}

/* CONTACT */
function editContact() {
    document.getElementById("contactEmail").value = contact.email || "";
    document.getElementById("contactInstagram").value = contact.instagram || "";
    document.getElementById("contactGithub").value = contact.github || "";
    document.getElementById("contactLinkedin").value = contact.linkedin || "";
    document.getElementById("contactOther").value = contact.other || "";
    openModal("contactModal");
}

function saveContact() {
    contact = {
        email:document.getElementById("contactEmail").value.trim(),
        instagram:normaliseUrl(document.getElementById("contactInstagram").value.trim()),
        github:normaliseUrl(document.getElementById("contactGithub").value.trim()),
        linkedin:normaliseUrl(document.getElementById("contactLinkedin").value.trim()),
        other:normaliseUrl(document.getElementById("contactOther").value.trim())
    };

    save(STORAGE.contact, contact);
    renderContact();
    closeModal("contactModal");
}

function normaliseUrl(url) {
    if (!url) return "";
    if (/^mailto:/i.test(url)) return url;
    if (/^https?:\/\//i.test(url)) return url;
    return "https://" + url;
}

function renderContact() {
    const box = document.getElementById("contactButtons");
    box.innerHTML = "";

    const links = [
        {label:"✉ Email", url:contact.email ? "mailto:" + contact.email : "", cls:"email"},
        {label:"◎ Instagram", url:contact.instagram, cls:"instagram"},
        {label:"◉ GitHub", url:contact.github, cls:"github"},
        {label:"in LinkedIn", url:contact.linkedin, cls:"linkedin"},
        {label:"🔗 Website", url:contact.other, cls:"other"}
    ];

    links.forEach(item => {
        if (!item.url) return;

        const a = document.createElement("a");
        a.href = item.url;
        a.target = item.url.startsWith("mailto:") ? "_self" : "_blank";
        a.rel = "noopener noreferrer";
        a.className = item.cls;
        a.textContent = item.label;
        box.appendChild(a);
    });

    if (!box.children.length) {
        box.innerHTML = `<p class="no-links">Click "Edit Links" to add your social media and website URLs.</p>`;
    }
}

/* MODALS */
function openModal(id) {
    document.getElementById(id).classList.add("show");
    document.body.classList.add("no-scroll");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("show");
    document.body.classList.remove("no-scroll");
}

document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal(modal.id);
    });
});

/* INITIAL RENDER */
document.getElementById("aboutText").textContent = aboutText;
renderProfile();
renderGoals();
renderGallery();
renderProjects();
renderContact();


/* ================= AUTH + CLOUD DATA ================= */
function getLocalData() {
    return { profile, goals, gallery, projects, contact, about: aboutText };
}

function setLocalData(data) {
    if (!data) return;
    profile = data.profile || profile;
    goals = Array.isArray(data.goals) ? data.goals : [];
    gallery = Array.isArray(data.gallery) ? data.gallery : [];
    projects = Array.isArray(data.projects) ? data.projects : defaultProjects;
    contact = data.contact || defaultContact;
    aboutText = data.about || aboutText;

    save(STORAGE.profile, profile);
    save(STORAGE.goals, goals);
    save(STORAGE.gallery, gallery);
    save(STORAGE.projects, projects);
    save(STORAGE.contact, contact);
    save(STORAGE.about, aboutText);

    document.getElementById("aboutText").textContent = aboutText;
    renderProfile();
    renderGoals();
    renderGallery();
    renderProjects();
    renderContact();
}

let cloudSaveTimer = null;
function scheduleCloudSave() {
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(saveCloudData, 700);
}

async function saveCloudData() {
    if (!cloudReady || !currentUser) return;

    const { error } = await supabaseClient
        .from("user_data")
        .upsert({
            user_id: currentUser.id,
            data: getLocalData(),
            updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });

    if (error) console.error("Cloud save error:", error);
}

async function loadCloudData() {
    if (!currentUser) return;

    const { data, error } = await supabaseClient
        .from("user_data")
        .select("data")
        .eq("user_id", currentUser.id)
        .maybeSingle();

    if (error) {
        console.error("Cloud load error:", error);
        alert("Cloud data load nahi ho paya. SQL table/RLS check karo.");
        return;
    }

    if (data && data.data) {
        cloudReady = false;
        setLocalData(data.data);
        cloudReady = true;
    } else {
        cloudReady = true;
        await saveCloudData();
    }
}

function updateAuthButton() {
    const btn = document.getElementById("authButton");
    if (!btn) return;
    btn.textContent = currentUser ? "Logout" : "Login";
    btn.title = currentUser ? (currentUser.email || "Logout") : "Login";
}

function handleAuthButton() {
    if (currentUser) logout();
    else openAuthModal();
}

function openAuthModal() {
    authMode = "login";
    updateAuthModal();
    openModal("authModal");
}

function toggleAuthMode() {
    authMode = authMode === "login" ? "signup" : "login";
    updateAuthModal();
}

function updateAuthModal() {
    const title = document.getElementById("authTitle");
    const submit = document.getElementById("authSubmit");
    const switchBtn = document.getElementById("authSwitch");
    const message = document.getElementById("authMessage");

    if (authMode === "login") {
        title.textContent = "🔐 Login";
        submit.textContent = "Login";
        switchBtn.textContent = "Create account";
        message.textContent = "Login to keep your personal data synced on PC and phone.";
    } else {
        title.textContent = "🆕 Create Account";
        submit.textContent = "Create Account";
        switchBtn.textContent = "Back to login";
        message.textContent = "Create your personal account. Use an email you can access.";
    }
}

async function submitAuth() {
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;

    if (!email || !password) {
        alert("Email aur password dono bharna hai.");
        return;
    }

    const submit = document.getElementById("authSubmit");
    submit.disabled = true;

    try {
        if (authMode === "signup") {
            const { data, error } = await supabaseClient.auth.signUp({ email, password });
            if (error) throw error;

            if (!data.session) {
                alert("Account ban gaya. Agar email confirmation maange, email verify karke phir Login karo.");
                authMode = "login";
                updateAuthModal();
            } else {
                closeModal("authModal");
            }
        } else {
            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;
            closeModal("authModal");
        }
    } catch (error) {
        alert(error.message || "Login/signup mein problem aa gayi.");
    } finally {
        submit.disabled = false;
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    cloudReady = false;
    currentUser = null;
    updateAuthButton();
    setLoginGate(true, "Logout ho gaya. Login karke dashboard open karo.");
}

async function initCloud() {
    setLoginGate(true);

    const { data } = await supabaseClient.auth.getSession();
    currentUser = data.session?.user || null;
    updateAuthButton();

    if (currentUser) {
        await loadCloudData();
        setLoginGate(false);
    } else {
        setLoginGate(true);
    }

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
        currentUser = session?.user || null;
        updateAuthButton();

        if (currentUser) {
            cloudReady = false;
            await loadCloudData();
            setLoginGate(false);
        } else {
            cloudReady = false;
            setLoginGate(true);
        }
    });
}

/* ================= FULL-SCREEN LOGIN GATE ================= */
let gateAuthMode = "login";

function setLoginGate(locked, message = "") {
    const body = document.body;
    const gate = document.getElementById("loginGate");
    if (!body || !gate) return;

    if (locked) {
        body.classList.add("auth-locked");
        gate.style.display = "flex";
    } else {
        body.classList.remove("auth-locked");
        gate.style.display = "none";
    }

    const status = document.getElementById("gateStatus");
    if (status && message) status.textContent = message;
}

function updateGateMode() {
    const title = document.getElementById("gateTitle");
    const message = document.getElementById("gateMessage");
    const submit = document.getElementById("gateSubmit");
    const switchBtn = document.getElementById("gateSwitch");

    if (!title || !message || !submit || !switchBtn) return;

    if (gateAuthMode === "login") {
        title.textContent = "Welcome Back";
        message.textContent = "Login to enter your personal world.";
        submit.textContent = "Login";
        switchBtn.textContent = "Create Account";
    } else {
        title.textContent = "Create Your Account";
        message.textContent = "Create your private account for your personal dashboard.";
        submit.textContent = "Create Account";
        switchBtn.textContent = "Back to Login";
    }
}

function toggleGateMode() {
    gateAuthMode = gateAuthMode === "login" ? "signup" : "login";
    const status = document.getElementById("gateStatus");
    if (status) status.textContent = "";
    updateGateMode();
}

async function submitGateAuth() {
    const emailEl = document.getElementById("gateEmail");
    const passwordEl = document.getElementById("gatePassword");
    const submit = document.getElementById("gateSubmit");
    const status = document.getElementById("gateStatus");

    const email = emailEl.value.trim();
    const password = passwordEl.value;

    if (!email || !password) {
        status.textContent = "Email aur password dono bharna hai.";
        return;
    }

    if (gateAuthMode === "signup" && password.length < 6) {
        status.textContent = "Password kam se kam 6 characters ka hona chahiye.";
        return;
    }

    submit.disabled = true;
    status.textContent = "Please wait...";

    try {
        if (gateAuthMode === "signup") {
            const { data, error } = await supabaseClient.auth.signUp({ email, password });
            if (error) throw error;

            if (!data.session) {
                gateAuthMode = "login";
                updateGateMode();
                status.textContent = "Account ban gaya. Email verify karke phir Login karo.";
            } else {
                status.textContent = "Account ready...";
            }
        } else {
            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;
            status.textContent = "Login successful...";
        }
    } catch (error) {
        status.textContent = error.message || "Login mein problem aa gayi.";
    } finally {
        submit.disabled = false;
    }
}

updateGateMode();
setLoginGate(true);
initCloud();
