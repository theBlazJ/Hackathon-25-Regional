async function saveData(id, value) {
    const res = await fetch(`/data/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
    });
    return res.json();
}

async function getData(id) {
    const res = await fetch(`/data/${id}`);
    return res.json();
}

async function deleteData(id) {
    const res = await fetch(`/data/${id}`, { method: 'DELETE' });
    return res.json();
}
