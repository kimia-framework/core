import { Global } from "../global";
import { config, errorLog } from "../helpers/server";
import { CoreRequest } from "../server/request";
import { Plugin } from "./plugin";

export interface NodeMailerConfig {
   host?: string;
   service?: string;
   port?: number;
   secure?: boolean; // true for 465, false for other ports
   auth: {
      user: string,
      pass: string;
   };
}


export class NodeMailer extends Plugin<NodeMailerConfig> {
   transporter;
   version = 3;
   /**************************************** */
   async init() {
      this.infoLog(`please set email variables EMAIL_HOST (or EMAIL_SERVICE), EMAIL_PORT, EMAIL_USER, EMAIL_PASS on config Otherwise created a test account by https://ethereal.email/`);
      // =>check config email vars
      if (config('EMAIL_HOST' as any) || config('EMAIL_SERVICE' as any)) {
         await this.setConfig({
            host: config('EMAIL_HOST' as any),
            port: config<number>('EMAIL_PORT' as any),
            service: config('EMAIL_SERVICE' as any),
            auth: {
               user: config('EMAIL_USER' as any),
               pass: config('EMAIL_PASS' as any),
            },
         });
      }
      // =>create test account
      else {
         const res = await this.createTestSMTP();
         if (res) {
            this.debugLog('created a test SMTP transporter by using ethereal.email');
         } else {
            return false;
         }
      }
      return true;
   }
   /**************************************** */
   async createTestSMTP(): Promise<boolean> {
      return new Promise((res) => {
         var nodemailer = require('nodemailer');
         // Generate SMTP service account from ethereal.email
         nodemailer.createTestAccount(async (err, account) => {
            // =>check error on create test account
            if (err) {
               this.errorLog('Failed to create a testing account. ' + err.message);
               res(false);
            }
            this.debugLog('Credentials obtained, sending message...');
            // Create a SMTP transporter object
            await this.setConfig({
               host: account.smtp.host,
               port: account.smtp.port,
               secure: account.smtp.secure,
               auth: {
                  user: account.user,
                  pass: account.pass
               }
            });
            res(true);
         });

      });
   }
   /**************************************** */
   async checkRequirements() {
      try {
         var nodemailer = require('nodemailer');
         return true;
      } catch (e) {
         return false;
      }
   }
   /**************************************** */
   async setConfig(config: NodeMailerConfig) {
      var nodemailer = require('nodemailer');
      this.config = config;
      this.transporter = nodemailer.createTransport(config);
      return true;
   }
   /**************************************** */
   requirementsInfo() {
      return `install 'nodemailer' package by 'npm i nodemailer --save'`;
   }
   /**************************************** */
   async sendMail(from: string, to: string, subject: string, html: string) {
      return new Promise((res) => {
         var nodemailer = require('nodemailer');
         const info = this.transporter.sendMail({
            from,
            to,
            subject,
            html,
         }, (err, info) => {
            if (err) {
               this.errorLog('Error occurred. ' + err.message);
               res(undefined);
            }

            this.debugLog(`Message sent by id ${info.messageId}, preview url is ${nodemailer.getTestMessageUrl(info)}`);
            res(info);
         });
      });
   }
   /**************************************** */
   async sendMailByTemplate(from: string, to: string, subject: string, request: CoreRequest, templateName: string, params?: object) {
      // =>render template
      const html = await Global.TemplateLoader.render(request, templateName, params);

      return await this.sendMail(from, to, subject, html);
   }
}