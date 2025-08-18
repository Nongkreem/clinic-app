const db = require('../config/db');

exports.createService = async ({ service_name, description, price, advice_ids }) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction(); //เริ่มต้น trasection
        
        // insert into services table
        const [serviceResult] = await connection.execute(
            'INSERT INTO services (service_name, description, price) VALUES (?, ?, ?)',
            [service_name, description, price]
        );
        const service_id = serviceResult.insertId;

        // insert into adviceService table
        if (advice_ids && advice_ids.length > 0) {
            const adviceServiceValues = advice_ids.map(advice_id => [service_id, advice_id])
            await connection.query(
                'INSERT INTO adviceService (service_id, advice_id) VALUES ?',
                [adviceServiceValues]
            )
        }
        await connection.commit();
        return { service_id, service_name, description, price, advice_ids };
    } catch (error) {
        await connection.rollback();
        console.error('Error creating service: ', error);
        throw error;
    } finally {
        connection.release(); // คืน connection ให้ pool
    }
};

exports.getAllServices = async () => {
    try {
        const [services] = await db.execute (
            'SELECT s.service_id, s.service_name, s.description, s.price, s.img_path FROM services s ORDER BY s.service_id DESC'
        );

        // ดึงแต่ละบริการและคำแนะนำของแต่ละบริการ
        for(let service of services) {
            const [advices] = await db.execute(
                `SELECT ad.advice_id, ad.advice_text
                 FROM adviceService asv
                 JOIN advice ad ON asv.advice_id = ad.advice_id
                 WHERE asv.service_id = ?
                `, [service.service_id]
            );
            service.advice_arr = advices; //เพื่ม array คำแนะนำเข้าไปใน obj บริการ

        }
        return services;
    } catch (error) {
        console.error('Error fetching all services: ', error);
        throw error;
    }
};

exports.updateService = async (service_id, { service_name, description, price, advice_ids }) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [updateServiceResult] = await connection.execute(
            'UPDATE services SET service_name = ?, description = ?, price = ? WHERE service_id = ?',
            [service_name, description, price, service_id]
        );

        await connection.execute('DELETE FROM adviceService WHERE service_id = ?', [service_id]);

        if (advice_ids && advice_ids.length > 0) {
            const adviceServiceValues = advice_ids.map(advice_id => [service_id, advice_id]);
            await connection.query(
                'INSERT INTO adviceService (service_id, advice_id) VALUES ?', [adviceServiceValues]
            );
        }
        await connection.commit();
        return updateServiceResult.affectedRows > 0;
    } catch (error){
        await connection.rollback();
        console.error('Error updating service: ', error);
        throw error;
    } finally {
        connection.release();
    }
}

exports.deleteService = async (service_id) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Delete from advice_service (ON DELETE CASCADE ใน DB schema ก็ช่วยได้ แต่ทำในโค้ดก็ปลอดภัย)
    await connection.execute('DELETE FROM adviceService WHERE service_id = ?', [service_id]);

    // 2. Delete from services table
    const [result] = await connection.execute('DELETE FROM services WHERE service_id = ?', [service_id]);

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting service:', error);
    throw error;
  } finally {
    connection.release();
  }
};