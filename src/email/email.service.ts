// email.service.ts

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ROLE_ENUM } from '@prisma/client';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendUserWelcome(
    user: {
      email: string;
      name: string;
      password?: string;
      role: ROLE_ENUM;
    },
    token: string,
  ) {
    const confirmation_url = `http://localhost:5173/activate?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: '"Parish Sacrament Monitoring System"',
      subject:
        'Welcome to Parish Sacrament Monitoring System! Confirm your Email',
      template: './register',
      context: {
        name: user.name,
        password: user.password,
        confirmation_url,
      },
    });
  }

  async sendForgotPassword(
    user: {
      email: string;
      name: string;
    },
    token: string,
  ) {
    const link = `http://localhost:5173/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: '"Parish Sacrament Monitoring System"',
      subject: 'Reset Password',
      template: './forgot-password',
      context: {
        name: user.name,
        link,
      },
    });
  }

  async sendNewApplication(
    user: { email: string; name: string },
    type: string,
    date: string,
  ) {
    const link = `http://localhost:5173/login`;

    await this.mailerService.sendMail({
      to: user.email,
      from: '"Parish Sacrament Monitoring System"',
      subject: 'New Application',
      template: './new-application',
      context: {
        name: user.name,
        type,
        date,
        link,
      },
    });
  }

  async approveOrRejectApplication(
    user: {
      email: string;
      name: string;
    },
    reason: string,
    internship_name: string,
  ) {
    const link = `http://localhost:5173/login`;

    await this.mailerService.sendMail({
      to: user.email,
      from: '" Parish Sacrament Monitoring System  "',
      subject: `Application ${
        reason == 'APPROVED' ? 'Accepted' : 'Rejected'
      } - Parish Sacrament Monitoring System `,
      template:
        reason == 'APPROVED' ? './approve-application' : './reject-application',
      context: {
        name: user.name,
        link,
        internship_name,
      },
    });
  }

  async requestPayment(user: { email: string; name: string }, amount: number) {
    const link = `http://localhost:5173/login`;

    await this.mailerService.sendMail({
      to: user.email,
      from: '"Parish Sacrament Monitoring System"',
      subject: 'Offering payment requested',
      template: './request-payment',
      context: {
        name: user.name,
        link,
        amount,
      },
    });
  }
}
