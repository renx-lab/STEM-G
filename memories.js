/* STEM12G - Updated Memories Logic
   - Allows Notes-only uploads (Photo is optional)
   - Fixes "Sealing" hang by adding error timeouts
   - Ensures loading screen always hides
*/

const memoryGrid = document.getElementById('memoryGrid');
const searchInput = document.getElementById('searchInput');
const uploadForm = document.getElementById('uploadForm');
const loadingLayer = document.getElementById('loadingLayer');

let allMemories = [];

// 1. FETCH MEMORIES
async function fetchMemories() {
    try {
        const { data, error } = await supabase
            .from('classmates')
            .select('*')
            .order('created_at', { ascending: true }); // Request: Earliest Upload First

        if (error) throw error;

        if (data && data.length > 0) {
            allMemories = data;
            renderCards(allMemories);
        } else {
            memoryGrid.innerHTML = `<p style="text-align:center; width:100%; margin-top:50px; color:#f4eee0; opacity:0.6;">The vault is empty. Be the first to seal a memory!</p>`;
        }
    } catch (err) {
        console.error("Database Connection Error:", err.message);
    } finally {
        // ALWAYS hide loading screen even if database is empty
        setTimeout(() => {
            loadingLayer.style.opacity = '0';
            setTimeout(() => loadingLayer.style.display = 'none', 1000);
        }, 1500);
    }
}

// 2. RENDER CARDS (Photo is now optional)
function renderCards(list) {
    memoryGrid.innerHTML = '';
    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'member-card';
        
        // Use a placeholder if no image was uploaded
        const imageContent = item.image_url 
            ? `<img src="${item.image_url}" alt="Memory">` 
            : `<div style="height:250px; display:flex; align-items:center; justify-content:center; background:#eee; color:#999; font-size:0.8rem;">Note Only</div>`;

        card.innerHTML = `
            <div class="photo-frame">${imageContent}</div>
            <h3 class="name-tag">${item.name}</h3>
            <p class="date-tag">Date: ${item.memory_date}</p>
            <p class="note-text">"${item.note}"</p>
        `;
        memoryGrid.appendChild(card);
    });
}

// 3. SEARCH LOGIC (Name or Date)
searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = allMemories.filter(m => 
        m.name.toLowerCase().includes(val) || 
        (m.memory_date && m.memory_date.includes(val))
    );
    renderCards(filtered);
});

// 4. UPLOAD LOGIC (FIXED FOR "FOREVER SEALING")
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('submitBtn');
    btn.innerText = "SEALING...";
    btn.disabled = true;

    const file = document.getElementById('uFile').files[0];
    const name = document.getElementById('uName').value;
    const date = document.getElementById('uDate').value;
    const note = document.getElementById('uNote').value;

    let publicImageUrl = null;

    try {
        // Step A: Upload Photo ONLY if one is selected
        if (file) {
            const fileName = `${Date.now()}_${file.name}`;
            const { data: sData, error: sErr } = await supabase.storage
                .from('photos')
                .upload(fileName, file);
            
            if (sErr) throw new Error("Storage Error: " + sErr.message);

            const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
            publicImageUrl = urlData.publicUrl;
        }

        // Step B: Insert into Table
        const { error: dbErr } = await supabase.from('classmates').insert([
            { 
                name: name, 
                memory_date: date, 
                note: note, 
                image_url: publicImageUrl // This will be null if no photo
            }
        ]);

        if (dbErr) throw new Error("Database Error: " + dbErr.message);

        // Success!
        location.reload();

    } catch (err) {
        // If it fails, stop "Sealing" and show the error
        alert("Upload Failed: " + err.message);
        btn.innerText = "SEAL RECORD";
        btn.disabled = false;
    }
});

// Modal UI
document.getElementById('openUploadBtn').onclick = () => document.getElementById('uploadModal').style.display = 'flex';

fetchMemories();
