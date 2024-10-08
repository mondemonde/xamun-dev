declare module 'puppeteer-chromium-resolver' {
    interface PCROptions {
        folderName?: string;
        hostName?: string;
        revision?: string;
        defaultHosts?: string[];
        downloadHost?: string;
        detectionPath?: string;
        browserType?: string;
        downloadPath?: string; // Added downloadPath property
    }

    interface PCRReturnValue {
        executablePath: string;
        folderPath: string;
        browser: any; // You might want to replace 'any' with a more specific type if available
        puppeteer: any; // You might want to replace 'any' with a more specific type if available
    }

    function PCR(options?: PCROptions): Promise<PCRReturnValue>;

    export = PCR;
}