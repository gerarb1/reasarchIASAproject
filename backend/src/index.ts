import { createApp } from './app';

const port = process.env.PORT || 3000;
const app = createApp();

app.listen(port, () => {
  console.log(`[Server] La plataforma de investigación científica se está ejecutando en http://localhost:${port}`);
  console.log(`[Server] Puedes iniciar sesión con el administrador predeterminado: admin@research.com / adminpassword123`);
});
