export function getDocsHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plataforma de Investigación Científica | Clean Architecture</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #0b0f19;
      --card-bg: rgba(17, 24, 39, 0.7);
      --border-color: rgba(255, 255, 255, 0.08);
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #00f2fe;
      --secondary: #4facfe;
      --accent: #a78bfa;
      --success: #34d399;
      --warning: #fbbf24;
      --error: #f87171;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-color);
      color: var(--text-main);
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      overflow-x: hidden;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(79, 172, 254, 0.1) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(167, 139, 250, 0.1) 0%, transparent 40%);
      background-attachment: fixed;
    }

    header {
      border-bottom: 1px solid var(--border-color);
      padding: 1.5rem 2rem;
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(11, 15, 25, 0.8);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo::before {
      content: '⚡';
      font-size: 1.2rem;
    }

    .tech-badge {
      background: rgba(79, 172, 254, 0.15);
      border: 1px solid rgba(79, 172, 254, 0.3);
      color: var(--primary);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }

    .hero {
      text-align: center;
      margin-bottom: 5rem;
    }

    .hero h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      letter-spacing: -1px;
      background: linear-gradient(to right, #fff, #9ca3af);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero p {
      font-size: 1.2rem;
      color: var(--text-muted);
      max-width: 700px;
      margin: 0 auto 2rem auto;
    }

    .glass-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 2rem;
      backdrop-filter: blur(16px);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
      transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }

    .glass-card:hover {
      transform: translateY(-4px);
      border-color: rgba(79, 172, 254, 0.3);
      box-shadow: 0 12px 40px 0 rgba(79, 172, 254, 0.15);
    }

    .section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 2.5rem;
      text-align: center;
      background: linear-gradient(135deg, #fff, var(--text-muted));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Architecture Grid */
    .arch-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
      margin-bottom: 5rem;
    }

    .arch-card h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .arch-card.domain h3 { color: var(--accent); }
    .arch-card.app h3 { color: var(--secondary); }
    .arch-card.infra h3 { color: var(--primary); }

    .arch-card ul {
      list-style-type: none;
      margin-top: 1rem;
    }

    .arch-card li {
      margin-bottom: 0.5rem;
      color: var(--text-muted);
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .arch-card li::before {
      content: '✓';
      color: var(--success);
    }

    /* Roles */
    .roles-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-bottom: 5rem;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 1rem;
      letter-spacing: 0.5px;
    }

    .role-badge.admin { background: rgba(248, 113, 113, 0.15); color: var(--error); border: 1px solid rgba(248, 113, 113, 0.3); }
    .role-badge.cleaner { background: rgba(251, 191, 36, 0.15); color: var(--warning); border: 1px solid rgba(251, 191, 36, 0.3); }
    .role-badge.student { background: rgba(52, 211, 153, 0.15); color: var(--success); border: 1px solid rgba(52, 211, 153, 0.3); }

    .role-card h4 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
    }

    .role-card p {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    /* Endpoints list */
    .endpoints-section {
      margin-bottom: 5rem;
    }

    .endpoint-item {
      background: rgba(17, 24, 39, 0.4);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem 1.5rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .endpoint-path {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .method {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 0.8rem;
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      min-width: 75px;
      text-align: center;
    }

    .method.post { background: rgba(52, 211, 153, 0.15); color: var(--success); border: 1px solid rgba(52, 211, 153, 0.3); }
    .method.get { background: rgba(79, 172, 254, 0.15); color: var(--primary); border: 1px solid rgba(79, 172, 254, 0.3); }
    .method.put { background: rgba(167, 139, 250, 0.15); color: var(--accent); border: 1px solid rgba(167, 139, 250, 0.3); }

    .path-text {
      font-family: monospace;
      font-size: 1rem;
      color: #fff;
    }

    .endpoint-desc {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    /* How to Test */
    .test-box {
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(11, 15, 25, 0.8));
      border: 1px solid rgba(79, 172, 254, 0.2);
    }

    .test-box h3 {
      font-family: 'Outfit', sans-serif;
      color: var(--primary);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .code-snippet {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      font-family: monospace;
      font-size: 0.9rem;
      color: #38bdf8;
      overflow-x: auto;
      margin-bottom: 1.5rem;
    }

    footer {
      text-align: center;
      padding: 3rem 2rem;
      border-top: 1px solid var(--border-color);
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2.5rem;
      }
      .endpoint-item {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  </style>
</head>
<body>

  <header>
    <div class="logo">ResearchCore API</div>
    <div class="tech-badge">Clean Architecture + TS</div>
  </header>

  <main>
    <section class="hero">
      <h1>Plataforma de Investigación Científica</h1>
      <p>API backend robusta estructurada bajo principios de Arquitectura Limpia (Clean Architecture). Diseñada para gestionar proyectos científicos con aislamiento estricto y flujos de revisión regulados.</p>
      <div class="tech-badge" style="font-size: 1rem; padding: 0.5rem 1.5rem;">Servidor Escuchando en Puerto 3000</div>
    </section>

    <h2 class="section-title">Estructura Arquitectónica</h2>
    <section class="arch-grid">
      <div class="glass-card arch-card domain">
        <h3><span>⚪</span> Dominio (Domain)</h3>
        <p>El núcleo del negocio. Entidades puras y reglas que gobiernan el flujo científico. Totalmente independiente de librerías y bases de datos.</p>
        <ul>
          <li>Entidades: User, Project, Paper</li>
          <li>Interfaces de Repositorio Abstractas</li>
          <li>Validaciones e invariantes de negocio</li>
        </ul>
      </div>

      <div class="glass-card arch-card app">
        <h3><span>🔵</span> Aplicación (Application)</h3>
        <p>Orquesta los flujos de datos. Ejecuta las operaciones específicas de la plataforma inyectando dependencias abstractas.</p>
        <ul>
          <li>Casos de Uso (Register, Create, Review)</li>
          <li>Servicios abstractos de encriptación y Token</li>
          <li>Implementación de políticas de acceso y roles</li>
        </ul>
      </div>

      <div class="glass-card arch-card infra">
        <h3><span>🟢</span> Infraestructura (Infrastructure)</h3>
        <p>Detalles técnicos externos. Framework Express, repositorios en memoria (desacoplados) y middlewares de autorización.</p>
        <ul>
          <li>Controladores HTTP inyectados</li>
          <li>InMemory Repositories intercambiables</li>
          <li>Middlewares de autenticación JWT y Zod</li>
        </ul>
      </div>
    </section>

    <h2 class="section-title">Roles y Reglas de Negocio</h2>
    <section class="roles-container">
      <div class="glass-card role-card">
        <span class="role-badge admin">ADMIN</span>
        <h4>Administrador del Sistema</h4>
        <p>Posee privilegios globales para crear usuarios y asignar proyectos de investigación a estudiantes. Sujeto obligatoriamente a validaciones estrictas de esquemas (Zod).</p>
      </div>

      <div class="glass-card role-card">
        <span class="role-badge student">STUDENT</span>
        <h4>Estudiante / Investigador</h4>
        <p>Aislamiento de datos estricto. Solo puede ver y subir papers dentro de los proyectos donde es el estudiante asignado. No puede ver papers en progreso de otros estudiantes.</p>
      </div>

      <div class="glass-card role-card">
        <span class="role-badge cleaner">DATA_CLEANER</span>
        <h4>Revisor y Limpiador de Datos</h4>
        <p>Tiene prohibido modificar el PDF o título original del paper subido por el estudiante. Su rol se restringe a analizar, limpiar y asignar el ranking científico (Q1-Q4).</p>
      </div>
    </section>

    <h2 class="section-title">Referencia de la API HTTP</h2>
    <section class="endpoints-section">
      <!-- Users -->
      <div class="endpoint-item">
        <div class="endpoint-path">
          <span class="method post">POST</span>
          <span class="path-text">/users/register</span>
        </div>
        <div class="endpoint-desc">Registrar un nuevo usuario (ADMIN, STUDENT, DATA_CLEANER)</div>
      </div>

      <div class="endpoint-item">
        <div class="endpoint-path">
          <span class="method post">POST</span>
          <span class="path-text">/users/login</span>
        </div>
        <div class="endpoint-desc">Autenticar credenciales y obtener JWT Token</div>
      </div>

      <div class="endpoint-item">
        <div class="endpoint-path">
          <span class="method get">GET</span>
          <span class="path-text">/users/profile</span>
        </div>
        <div class="endpoint-desc">Obtener el perfil del usuario logueado (Requiere Bearer Token)</div>
      </div>

      <!-- Projects -->
      <div class="endpoint-item">
        <div class="endpoint-path">
          <span class="method post">POST</span>
          <span class="path-text">/projects</span>
        </div>
        <div class="endpoint-desc">Crear un proyecto de investigación (Solo ADMIN)</div>
      </div>

      <div class="endpoint-item">
        <div class="endpoint-path">
          <span class="method get">GET</span>
          <span class="path-text">/projects</span>
        </div>
        <div class="endpoint-desc">Listar todos los proyectos de investigación</div>
      </div>

      <div class="endpoint-item">
        <div class="endpoint-path">
          <span class="method get">GET</span>
          <span class="path-text">/projects/:id</span>
        </div>
        <div class="endpoint-desc">Ver proyecto y papers (Filtra papers no aprobados si es estudiante ajeno)</div>
      </div>

      <!-- Papers -->
      <div class="endpoint-item">
        <div class="endpoint-path">
          <span class="method post">POST</span>
          <span class="path-text">/projects/:id/papers</span>
        </div>
        <div class="endpoint-desc">Subir paper a proyecto (Filtra por estudiante asignado)</div>
      </div>

      <div class="endpoint-item">
        <div class="endpoint-path">
          <span class="method put">PUT</span>
          <span class="path-text">/projects/papers/:paperId/review</span>
        </div>
        <div class="endpoint-desc">Aprobar, limpiar y rankear paper (Solo DATA_CLEANER y ADMIN, PDF inmutable)</div>
      </div>
    </section>

    <h2 class="section-title">¿Cómo probar la API?</h2>
    <section class="glass-card test-box">
      <h3>🚀 Ciclo de Feedback y Pruebas Rápidas</h3>
      <p style="margin-bottom: 1rem;">Para acelerar el desarrollo y validar todos los flujos sin depender de Postman, hemos preparado un archivo REST Client en la raíz del proyecto. Este archivo contiene variables que capturan tokens y IDs automáticamente de las respuestas.</p>
      
      <p style="margin-bottom: 0.5rem; font-weight: 600;">Paso 1: Abre el archivo en tu editor:</p>
      <div class="code-snippet">api-tests.http</div>

      <p style="margin-bottom: 0.5rem; font-weight: 600;">Paso 2: Ejecuta las peticiones secuenciales:</p>
      <ul style="list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.95rem;">
        <li>Haz click en "Send Request" en la llamada <b>Login de Administrador</b> (Utiliza las credenciales por defecto: admin@research.com / adminpassword123).</li>
        <li>Registra un nuevo estudiante a través de la llamada.</li>
        <li>Crea un proyecto asignándole el ID del estudiante registrado (capturado automáticamente).</li>
        <li>Haz login con el estudiante y sube un paper. Las pruebas de aislamiento fallarán si intentas subir a un proyecto que no te pertenece.</li>
        <li>Prueba la llamada de limpieza con el rol de Data Cleaner para validar que no puede alterar el PDF o título.</li>
      </ul>
      
      <p style="margin-bottom: 0.5rem; font-weight: 600;">Paso 3 (Opcional): Ejecuta los tests automatizados en la consola:</p>
      <div class="code-snippet">npm test</div>
    </section>
  </main>

  <footer>
    <p>© 2026 Plataforma de Investigación Científica - Construido con arquitectura de capas limpias.</p>
  </footer>

</body>
</html>`;
}
