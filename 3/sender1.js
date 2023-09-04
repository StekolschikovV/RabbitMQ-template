const amqp = require('amqplib');

async function sendMessage() {
    const connection = await amqp.connect('amqp://localhost'); // URL RabbitMQ сервера
    const channel = await connection.createChannel();

    // Создайте временную очередь для получения ответа
    const {queue} = await channel.assertQueue('', {exclusive: true});

    // Определите тип запроса
    const requestType = 'type1';

    // Отправка запроса
    const request = {
        type: requestType,
        content: 'Запрос типа 1',
        replyTo: queue, // Указываем очередь для получения ответа
    };

    const run = async () => {
        const correlationId = "1_" + Math.random().toString()
        console.log("correlationId:", correlationId)
        channel.sendToQueue('requests', Buffer.from(JSON.stringify(request)), {
            replyTo: queue,
            correlationId: correlationId,
        });
        console.log(`Отправлен запрос: ${JSON.stringify(request)}`);
        await new Promise((resolve) => {
            channel.consume(queue, (message) => {
                console.log("+correlationId", message.properties.correlationId)
                if (message.properties.correlationId === correlationId) {
                    console.log(`Получен ответ: ${message.content.toString()}`);
                    resolve();
                } else {
                    channel.nack(message);
                }
            }, {noAck: false});
        });
        setTimeout(e => run(), Math.random() * 100)
    }
    run()
    // // Ожидание ответа
    // await new Promise((resolve) => {
    //     channel.consume(queue, (message) => {
    //         console.log(`Получен ответ: ${message.content.toString()}`);
    //         resolve();
    //     }, {noAck: true});
    // });
    //
    // // Закрытие соединения
    // setTimeout(() => {
    //     connection.close();
    //     process.exit(0);
    // }, 500);
}

sendMessage();
