const amqp = require('amqplib');

async function sendMessage() {
    const connection = await amqp.connect('amqp://localhost'); // URL RabbitMQ сервера
    const channel = await connection.createChannel();

    // Создайте временную очередь для получения ответа
    const {queue} = await channel.assertQueue('q3', {exclusive: true, durable: true});

    // Определите тип запроса
    const requestType = 'type3';

    // Отправка запроса
    const request = {
        type: requestType,
        content: 'Запрос типа 3',
        replyTo: queue, // Указываем очередь для получения ответа
    };

    const run = async () => {
        const correlationId = "3_" + Math.random().toString()
        console.log("correlationId:", correlationId)
        channel.sendToQueue('requests', Buffer.from(JSON.stringify(request)), {
            replyTo: queue,
            correlationId: correlationId,
        });
        console.log(`Отправлен запрос: ${JSON.stringify(request)}`);
        setTimeout(e => run(), Math.random() * 1000)
    }
    run()
}

sendMessage();
