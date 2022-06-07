import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import fs from "fs"
import { S3Client, GetObjectCommand,GetObjectCommandInput } from "@aws-sdk/client-s3";

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 6000;


const S3 = new S3Client({
  region: "ap-southeast-1",
  maxAttempts: 5,
  credentials: {
    accessKeyId: process.env.S3_KEY as string ,
    secretAccessKey:  process.env.S3_SECRET as string,
  },
});

app.get('/', async(req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
  try {
      // Create a helper function to convert a ReadableStream to a string.
      const streamToString = (stream:any) =>
      new Promise((resolve, reject) => {
        const chunks:any = [];
        stream.on("data", (chunk:any) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });
      
    const getObject: GetObjectCommandInput = {
      Bucket: "marketing-masters-bucket",
      Key: "docu.txt",
    };

    const data = await S3.send(new GetObjectCommand(getObject));
    const bodyContents = await streamToString(data.Body) as string;
    console.log(bodyContents,"💎 💎 💎 ") 
    const secretsJSON = JSON.parse(bodyContents);
      
    let secretsString = "";
    console.log(data," 🔥  🔥  🔥 ")
    Object.keys(secretsJSON).forEach((key) => {
        secretsString += `${key}=${secretsJSON[key]}\n`;
    });
    fs.writeFileSync(".env", secretsString,  { flag: 'w' });

    //configure dotenv package
    dotenv.config();
  } catch (error) {
    console.log(error)
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});