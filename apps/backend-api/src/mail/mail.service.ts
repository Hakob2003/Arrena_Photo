import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendVerificationEmail(email: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const url = `${frontendUrl}/verify?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Добро пожаловать в Arrena Photo! Подтвердите ваш Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">Подтверждение Email</h2>
          <p>Здравствуйте,</p>
          <p>Пожалуйста, нажмите на кнопку ниже, чтобы подтвердить ваш адрес электронной почты:</p>
          <p style="margin: 30px 0;">
            <a href="${url}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Подтвердить Email
            </a>
          </p>
          <p>Если кнопка не работает, скопируйте эту ссылку в браузер:</p>
          <p><a href="${url}">${url}</a></p>
        </div>
      `,
    });
  }
}
