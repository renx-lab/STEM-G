/* STEM12G - memories.js
   Logic for Gallery, Search, and Uploading to Supabase
*/

const memoryGrid = document.getElementById('memoryGrid');
const searchInput = document.getElementById('searchInput');
const uploadForm = document.getElementById('uploadForm');
const loadingLayer = document.getElementById('loadingLayer');

let allMemories = [];

// 1. Fetch Memories from Supabase
async function fetchMemories() {
    try {
        // We order by 'created_at' to show the earliest uploads first
        const { data, error } = await supabase
            .from('classmates')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
            allMemories = data;
            renderCards(allMemories);
        } else {
            // Display message if vault is empty
            memoryGrid.innerHTML = `
                <div class="typewriter-text" style="grid-column: 1/-1; margin-top: 50px;">
                    The vault is currently empty. Be the first to seal a memory.
                </div>`;
        }
    } catch (err) {
        console.error("Database error:", err.message);
    } finally {
        // ALWAYS hide loading screen after attempt
        setTimeout(() => {
            loadingLayer.style.opacity = '0';
            setTimeout(() => loadingLayer.style.display = 'none', 1000);
        }, 1500);
    }
}

// 2. Render Polaroid Cards
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

// 3. Search Bar Logic (Filters Name or Date)
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allMemories.filter(m => 
        m.name.toLowerCase().includes(term) || 
        (m.memory_date && m.memory_date.includes(term))
    );
    renderCards(filtered);
});

// 4. Handle Upload Form Submission
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('submitBtn');
    btn.innerText = "SEALING RECORD...";
    btn.disabled = true;

    const file = document.getElementById('uFile').files[0];
    const name = document.getElementById('uName').value;
    const date = document.getElementById('uDate').value;
    const note = document.getElementById('uNote').value;

    try {
        // A. Upload Image to 'photos' bucket
        const fileName = `${Date.now()}_${file.name}`;
        const { data: sData, error: sErr } = await supabase.storage
            .from('photos')
            .upload(fileName, file);

        if (sErr) throw sErr;

        // B. Get Public URL of the photo
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);

        // C. Insert Text Data into 'classmates' table
        const { error: dbErr } = await supabase.from('classmates').insert([{
            name: name,
            memory_date: date,
            note: note,
            image_url: urlData.publicUrl
        }]);

        if (dbErr) throw dbErr;

        // Success: Refresh page
        location.reload();

    } catch (err) {
        alert("Action Failed: " + err.message);
        btn.innerText = "SEAL RECORD";
        btn.disabled = false;
    }
});

// Modal UI Controls
document.getElementById('openUploadBtn').onclick = () => {
    document.getElementById('uploadModal').style.display = 'flex';
};

// Start the process
fetchMemories();
