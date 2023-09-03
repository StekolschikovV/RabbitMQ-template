import amqp, {Channel} from 'amqplib';

class Queue {

    connection!: amqp.Connection
    channel!: Channel
    channelC!: Channel
    queueName!: string
    queueNameC!: string

    constructor(queueName = "tasks", consumeQueueName = "consume") {
        this.queueName = queueName
        this.queueNameC = consumeQueueName
        this.init()
    }

    public set = (massage: string) => {
        this.channel.sendToQueue(this.queueName, Buffer.from(massage))
        this.channelC.sendToQueue(this.queueNameC, Buffer.from(massage))
    }

    public setC = (massage: string) => {
        this.channelC.sendToQueue(this.queueNameC, Buffer.from(massage))
    }

    public getOne = async (): Promise<string | null> => {
        const message = await this.channel.get(this.queueName);
        let result
        if (message) {
            result = message.content.toString()
            this.channel.ack(message);
        } else {
            result = null
        }
        return result
    }

    public getAll = async () => {
        return new Promise(async (resolve, reject) => {
            let result: string[] = []
            while (true) {
                const message = await this.channel.get(this.queueName);
                if (!message) {
                    break;
                }
                result.push(message.content.toString())
                this.channel.ack(message);
            }
            resolve(result)
        })
    }

    public destroy = async () => {
        await this.channel.close();
        await this.channelC.close();
        await this.connection.close();
    }

    private consume = () => {
        this.channelC.consume(this.queueNameC, message => {
            if (message) {
                console.log("+++consume:", message.content.toString())
                this.channelC.ack(message);
            }
        })
    }

    private init = async () => {
        this.connection = await amqp.connect('amqp://localhost');
        this.channel = await this.connection.createChannel();
        this.channelC = await this.connection.createChannel();
        await this.channel.assertQueue(this.queueName);
        await this.channelC.assertQueue(this.queueNameC);
        this.consume()
    }

}

const q = new Queue()
export default q