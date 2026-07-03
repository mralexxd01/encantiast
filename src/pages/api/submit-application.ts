import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Faltan variables de entorno críticas en el servidor.");
      return new Response('Error: Configuración de Supabase incompleta.', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const formData = await request.formData();
    
    const nombre = (formData.get('nombre') as string)?.trim();
    const discord = (formData.get('discord') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const telefono = (formData.get('telefono') as string)?.trim() || 'No especificado';
    const rol = formData.get('rol') as string;
    const motivo = formData.get('motivo') as string;
    const aceptaTerminos = formData.get('acepta_terminos') as string;
    const firmaTexto = (formData.get('firma') as string)?.trim();

    // 1. Validación estricta de campos obligatorios
    if (!nombre || !discord || !email || !rol || !motivo || aceptaTerminos !== 'true' || !firmaTexto) {
      return new Response('Campos obligatorios incompletos o términos no aceptados.', { status: 400 });
    }

    // 🔒 2. VALIDACIÓN CRÍTICA: Comprobar que la firma coincida exactamente con el nombre completo
    if (nombre.toLowerCase() !== firmaTexto.toLowerCase()) {
      return new Response('Error: El texto de la firma debe coincidir exactamente con tu Nombre y Apellidos.', { status: 400 });
    }

    // Captura de metadatos temporales exactos
    const ahora = new Date();
    const fechaFormateada = ahora.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const horaFormateada = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Generación del expediente PDF
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 55 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Cabecera Corporativa
      doc.font('Helvetica-Bold').fillColor('#0f172a').fontSize(24).text('ENCANTIA STUDIOS', { align: 'center', characterSpacing: 3 });
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(9).fillColor('#64748b').text('EXPEDIENTE DE CANDIDATURA OFICIAL', { align: 'center', characterSpacing: 1 });
      doc.moveDown(1.5);
      doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(55, doc.y).lineTo(540, doc.y).stroke();
      doc.moveDown(1.5);

      // Bloque 1: Datos de Contacto
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#7c3aed').text('01. DATOS DE CONTACTO');
      doc.moveDown(0.6);
      
      const labelX = 60;
      const valueX = 180;
      const renderRow = (label: string, value: string) => {
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#475569').text(label, labelX, doc.y, { continued: true });
        doc.font('Helvetica').fillColor('#0f172a').text(value, valueX);
        doc.moveDown(0.5);
      };

      renderRow('Nombre Completo:', nombre);
      renderRow('Identificador Discord:', discord);
      renderRow('Correo Electrónico:', email);
      renderRow('Teléfono Móvil:', telefono);
      doc.moveDown(1);

      // Bloque 2: Puesto Solicitado
      doc.x = 55; 
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#7c3aed').text('02. PUESTO SOLICITADO');
      doc.moveDown(0.6);
      renderRow('Rol / Especialidad:', rol);
      doc.moveDown(1);

      // Bloque 3: Exposición de Motivos
      doc.x = 55;
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#7c3aed').text('03. EXPOSICIÓN DE MOTIVOS');
      doc.moveDown(0.6);
      doc.font('Helvetica').fontSize(10).fillColor('#1e293b').text(motivo, { align: 'justify', lineGap: 5 });
      doc.moveDown(2);

      // Bloque 4: Términos y Verificación Legal Auditada
      doc.x = 55;
      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(55, doc.y).lineTo(540, doc.y).stroke();
      doc.moveDown(1);
      
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#64748b').text('TÉRMINOS, CONDICIONES Y PROTECCIÓN DE DATOS');
      doc.moveDown(0.5);
      
      const terminosTexto = 
        "Al enviar este formulario de candidatura, el solicitante declara bajo su responsabilidad que todos los datos proporcionados son verídicos, exactos y actualizados. Encantia Studios se compromete al tratamiento confidencial de los datos personales facilitados de acuerdo con las normativas internacionales de protección de datos (RGPD). La información recogida en este expediente será utilizada única y exclusivamente para evaluar la aptitud del candidato en los procesos de selección internos del estudio.";
      doc.font('Helvetica').fontSize(7.5).fillColor('#94a3b8').text(terminosTexto, { align: 'justify', lineGap: 3 });
      doc.moveDown(1.2);

      // ⏱️ ESTAMPADO DE AUDITORÍA: REGISTRO DE FECHA Y HORA EXACTA
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#16a34a')
         .text(`✓ CONSENTIMIENTO REGISTRADO Y AUDITADO`);
      doc.font('Helvetica').fontSize(8).fillColor('#334155')
         .text(`• Fecha de aceptación: ${fechaFormateada}`)
         .text(`• Hora exacta de registro: ${horaFormateada} (CET)`)
         .text(`• Verificación de Firma: Coincidencia de identidad declarada válida.`);
      doc.moveDown(2.5);

      // Cuadro de Firma Caligráfica
      doc.x = 320;
      doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(320, doc.y).lineTo(520, doc.y).stroke();
      doc.moveDown(0.5);
      
      doc.font('Times-Italic')
         .fontSize(18)
         .fillColor('#7c3aed')
         .text(firmaTexto, { align: 'center', width: 200 });
      
      doc.moveDown(0.2);
      doc.font('Helvetica')
         .fontSize(8)
         .fillColor('#64748b')
         .text('Firma Digital Vincular del Autor', { align: 'center', width: 200 });

      doc.end();
    });

    const timestamp = Date.now();
    const cleanDiscord = discord.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanRol = rol.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${cleanRol}_${cleanDiscord}_${timestamp}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('postulaciones')
      .upload(`nuevas/${fileName}`, pdfBuffer, {
        contentType: 'application/pdf',
        duplex: 'half'
      });

    if (uploadError) {
      console.error('Error Supabase Storage:', uploadError.message);
      return new Response('Error al almacenar el archivo de postulación', { status: 500 });
    }

    return redirect('/?status=success', 303);

  } catch (err) {
    console.error('Fatal Server Error:', err);
    return new Response('Error interno del servidor al procesar el expediente', { status: 500 });
  }
};