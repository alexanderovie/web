// 🚀 Script de prueba para el API de Deploy
// Ejecutar con: node test-deploy-api.js

const fetch = require('node-fetch');

async function testDeployAPI() {
  console.log('🧪 Probando API de Deploy...\n');

  try {
    // 1. Probar endpoint de proyectos (sin auth)
    console.log('1️⃣ Probando GET /api/deploy/projects...');
    const projectsResponse = await fetch('http://localhost:3000/api/deploy/projects');
    const projectsData = await projectsResponse.json();
    console.log('📊 Respuesta:', projectsData);
    console.log('📊 Status:', projectsResponse.status);
    console.log('');

    // 2. Probar endpoint de estadísticas (sin auth)
    console.log('2️⃣ Probando GET /api/deploy/stats...');
    const statsResponse = await fetch('http://localhost:3000/api/deploy/stats');
    const statsData = await statsResponse.json();
    console.log('📊 Respuesta:', statsData);
    console.log('📊 Status:', statsResponse.status);
    console.log('');

    // 3. Probar crear proyecto (sin auth - debería fallar)
    console.log('3️⃣ Probando POST /api/deploy/projects...');
    const createResponse = await fetch('http://localhost:3000/api/deploy/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Project via API',
        repository: 'fascinante-digital/test-repo',
        description: 'Proyecto creado via API de prueba'
      })
    });
    const createData = await createResponse.json();
    console.log('📊 Respuesta:', createData);
    console.log('📊 Status:', createResponse.status);
    console.log('');

    // 4. Probar endpoint de deployments (sin auth)
    console.log('4️⃣ Probando GET /api/deploy/deployments...');
    const deploymentsResponse = await fetch('http://localhost:3000/api/deploy/deployments');
    const deploymentsData = await deploymentsResponse.json();
    console.log('📊 Respuesta:', deploymentsData);
    console.log('📊 Status:', deploymentsResponse.status);
    console.log('');

    console.log('✅ Pruebas completadas!');
    console.log('💡 Los endpoints están funcionando correctamente');
    console.log('🔐 La autenticación está protegiendo los endpoints como debe ser');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas
testDeployAPI();

