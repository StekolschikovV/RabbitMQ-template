const amqp = require('amqplib');

async function receiveMessage() {
    const connection = await amqp.connect('amqp://localhost'); // URL RabbitMQ сервера
    const channel = await connection.createChannel();

    // Создайте общую очередь для запросов
    const requestQueue = 'requests';
    await channel.assertQueue(requestQueue, {durable: true});

    console.log('Ожидание запросов...');

    // Обработка запросов
    channel.consume(requestQueue, (message) => {
        const content = message.content.toString();
        console.log(`Получен запрос: ${content}`);
        console.log(message.properties)

        // Парсим сообщение и определяем тип запроса
        const parsedMessage = JSON.parse(content);
        const responseType = parsedMessage.type;

        // Отправка ответа на очередь ответов отправителя
        const responseQueue = parsedMessage.replyTo;
        const response = `Ответ на запрос типа ${responseType}`;
        channel.sendToQueue(responseQueue, Buffer.from(response), {
            correlationId: message.properties.correlationId,
        });
    }, {noAck: true});
}

receiveMessage();
