import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import q from "./queue";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;


app.get('/get-one', async (req: Request, res: Response) => {
    res.send(await q.getOne());
});

app.get('/get-all', async (req: Request, res: Response) => {
    res.send(await q.getAll());

});

app.get('/set', (req: Request, res: Response) => {
    const {message} = req.query
    if (typeof message === "string") {
        q.set(message)
        res.send('Sent');
    } else {
        res.send('No data');
    }
});


app.get('/set-c', (req: Request, res: Response) => {
    const {message} = req.query
    if (typeof message === "string") {
        q.setC(message)
        res.send('Sent');
    } else {
        res.send('No data');
    }
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});