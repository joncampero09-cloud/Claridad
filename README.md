# Claridad (web)

Carpeta lista para tu repositorio de GitHub conectado a Vercel.
Sube/reemplaza estos archivos en GitHub y Vercel publica solo:

- public/index.html  -> la página (diseño nuevo)
- public/posts.json  -> tus publicaciones (se editan aquí)
- api/ai.js          -> conexión con la IA
- package.json

Para que la IA funcione, en Vercel agrega la variable ANTHROPIC_API_KEY
(Project > Settings > Environment Variables) y haz Redeploy.
Opcional: DAILY_LIMIT (usos de IA por persona al día, por defecto 30).
