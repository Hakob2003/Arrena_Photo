import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-vkontakte';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VkStrategy extends PassportStrategy(Strategy, 'vkontakte') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('VK_CLIENT_ID') || 'placeholder',
      clientSecret: configService.get<string>('VK_CLIENT_SECRET') || 'placeholder',
      callbackURL: `${configService.get<string>('NEXT_PUBLIC_API_URL', 'http://localhost:4000/api')}/auth/vk/callback`,
      scope: ['email'],
      profileFields: ['email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    params: any,
    profile: any,
    done: any,
  ): Promise<any> {
    const email = params.email || (profile.emails && profile.emails[0]?.value);
    const user = {
      email,
      name: profile.displayName,
      providerAccountId: profile.id,
      accessToken,
    };
    done(null, user);
  }
}
