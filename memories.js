const memoryGrid = document.getElementById('memoryGrid');
const searchInput = document.getElementById('searchInput');
const uploadForm = document.getElementById('uploadForm');
const loadingLayer = document.getElementById('loadingLayer');

let allMemories = [];

// 1. Fetch from Supabase (Earliest Upload First)
async function fetchMemories() {
    const { data, error } = await supabase
        .from('classmates')
        .select('*')
        .order('created_at', { ascending: true }); // Request: List by earliest upload

    if (!error) {
        allMemories = data;
        renderCards(allMemories);
    }
    
    // Hide Loading Screen
    setTimeout(() => {
        loadingLayer.style.opacity = '0';
        setTimeout(() => loadingLayer.style.visibility = 'hidden', 1000);
    }, 1500);
}

// 2. Render Cards to Grid
function renderCards(list) {
    memoryGrid.innerHTML = '';
    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'member-card';
        card.innerHTML = `
            <div class="photo-frame">
                <img src="${item.image_url}" alt="${item.name}">
            </div>
            <h3 class="name-tag">${item.name}</h3>
            <p class="date-tag">Recorded: ${item.memory_date}</p>
            <p class="note-text">"${item.note}"</p>
        `;
        memoryGrid.appendChild(card);
    });
}

// 3. Search Bar Logic (Filter by Name or Date)
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allMemories.filter(m => 
        m.name.toLowerCase().includes(term) || 
        m.memory_date.includes(term)
    );
    renderCards(filtered);
});

// 4. Handle Upload (Text + Photo)
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerText = "Sealing into Vault...";
    btn.disabled = true;

    const file = document.getElementById('photoUpload').files[0];
    const fileName = `${Date.now()}_${file.name}`;

    // Upload Photo to Supabase Storage
    const { data: sData, error: sErr } = await supabase.storage
        .from('photos')
        .upload(fileName, file);

    if (sErr) return alert("Storage Error: " + sErr.message);

    // Get Image Public URL
    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);

    // Insert Text Record into Database
    const { error: dbErr } = await supabase.from('classmates').insert([{
        name: document.getElementById('uploaderName').value,
        memory_date: document.getElementById('memoryDate').value,
        note: document.getElementById('uploaderNote').value,
        image_url: urlData.publicUrl
    }]);

    if (!dbErr) {
        location.reload(); // Refresh to see the new earliest-first list
    } else {
        alert("Database Error: " + dbErr.message);
        btn.disabled = false;
        btn.innerText = "Seal into Vault";
    }
});

// Modal Controls
document.getElementById('openUploadBtn').onclick = () => document.getElementById('uploadModal').style.display = 'flex';
document.querySelector('.close-modal').onclick = () => document.getElementById('uploadModal').style.display = 'none';

fetchMemories();
