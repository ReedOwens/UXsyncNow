import * as notifier from 'node-notifier';
import * as path from 'path';


export class Notify {
    private static _showMessage = false;

    static message(msg: string, title = "UXsyncNow", icon = 'cloud-upload.png') {
        if (Notify._showMessage) {
            notifier.notify(
                {
                    title: title,
                    message: msg,
                    wait: false,
                    sound: true,
                    icon: path.join(__dirname, '../images', icon)
                },
                (err, response) => {
                    // Handle any responses
                }
            );
        }
    }

    static set showMessage( value: boolean ) {
        Notify._showMessage = value;
    }
}