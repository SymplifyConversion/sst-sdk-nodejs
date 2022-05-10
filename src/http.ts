import https from "https";

export function httpsGET(rawURL: string): Promise<string> {
    return new Promise((resolve, reject) => {
        https
            .get(rawURL, (res) => {
                if (res.statusCode != 200) {
                    reject("unhandled response status: " + res.statusCode);
                }

                let body = "";

                res.on("data", (chunk) => {
                    body += chunk;
                });

                res.on("close", () => {
                    reject("closed");
                });

                res.on("error", (err) => {
                    reject("receive error: " + err);
                });

                res.on("end", () => {
                    resolve(body);
                });
            })
            .on("error", (err) => {
                reject("connect error: " + err);
            });
    });
}
