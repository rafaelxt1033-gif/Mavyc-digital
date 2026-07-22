// Arquivo: api/sync.js
export default async function handler(req, res) {
    // Permite apenas requisições PUT (Envio de atualização)
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { repo, content, message } = req.body;
    const token = process.env.GITHUB_TOKEN; // Aqui a Vercel puxa o Token secreto!

    if (!token) {
        return res.status(500).json({ error: 'Token do GitHub não configurado na Vercel.' });
    }

    try {
        const url = `https://api.github.com/repos/${repo}/contents/precos.json`;

        // 1. O servidor (invisível) verifica qual é o SHA atual do arquivo na nuvem
        let sha = "";
        const checkRes = await fetch(url, {
            headers: { "Authorization": `token ${token}` }
        });
        
        if (checkRes.ok) {
            const data = await checkRes.json();
            sha = data.sha;
        }

        // 2. O servidor envia o novo arquivo atualizado com o Token embutido
        const githubReq = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message || "Backup via Vercel Proxy (Mavyc)",
                content: content,
                branch: "main",
                sha: sha
            })
        });

        if (!githubReq.ok) {
            return res.status(githubReq.status).json({ error: 'Falha ao salvar no GitHub' });
        }

        return res.status(200).json({ success: true, message: 'Backup concluído com segurança!' });
        
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor Mavyc' });
    }
}
