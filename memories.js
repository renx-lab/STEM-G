/* STEM12G - Emergency Update 
   - Forces an error message if Supabase hangs
   - Photo is completely optional
*/

const memoryGrid = document.getElementById('memoryGrid');
const uploadForm = document.getElementById('uploadForm');

async function fetchMemories() {
    try {
        const { data, error } = await supabase
            .from('classmates')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        renderCards(data || []);
    } catch (err) {
        console.error("Fetch failed:", err.message);
    } finally {
        document.getElementById('loadingLayer').style.display = 'none';
    }
}

function renderCards(list) {
    memoryGrid.innerHTML = '';
    if (list.length === 0) {
        memoryGrid.innerHTML = '<p style="color:white; text-align:center; grid-column:1/-1;">No memories yet.</p>';
        return;
    }
    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'member-card';
        card.innerHTML = `
            <div class="photo-frame">
                ${item.image_url ? `<img src="${item.image_url}">` : `<div style="padding:20px; color:#999;">No Photo</div>`}
            </div>
            <h3 class="name-tag">${item.name}</h3>
            <p class="date-tag">${item.memory_date}</p>
            <p class="note-text">"${item.note}"</p>
        `;
        memoryGrid.appendChild(card);
    });
}

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    
    // UI Feedback
    btn.innerText = "ATTEMPTING...";
    btn.disabled = true;

    const file = document.getElementById('uFile').files[0];
    const name = document.getElementById('uName').value;
    const date = document.getElementById('uDate').value;
    const note = document.getElementById('uNote').value;

    let uploadedUrl = null;

    try {
        // STEP 1: UPLOAD PHOTO (If selected)
        if (file) {
            btn.innerText = "UPLOADING PHOTO...";
            const fName = `${Date.now()}-${file.name}`;
            const { data, error: sErr } = await supabase.storage
                .from('photos')
                .upload(fName, file);

            if (sErr) throw new Error("PHOTO ERROR: " + sErr.message);

            const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fName);
            uploadedUrl = urlData.publicUrl;
        }

        // STEP 2: SAVE TO DATABASE
        btn.innerText = "SAVING NOTE...";
        const { error: dbErr } = await supabase.from('classmates').insert([
            { name, memory_date: date, note, image_url: uploadedUrl }
        ]);

        if (dbErr) throw new Error("DATABASE ERROR: " + dbErr.message);

        // SUCCESS
        alert("Memory Sealed Successfully!");
        location.reload();

    } catch (err) {
        // THIS STOPS THE "FOREVER" HANG
        alert(err.message);
        btn.innerText = "SEAL RECORD";
        btn.disabled = false;
    }
});

document.getElementById('openUploadBtn').onclick = () => document.getElementById('uploadModal').style.display = 'flex';
fetchMemories();
