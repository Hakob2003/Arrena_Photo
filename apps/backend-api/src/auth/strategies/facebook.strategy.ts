import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_CLIENT_ID') || 'placeholder',
      clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET') || 'placeholder',
      callbackURL: `${configService.get<string>('NEXT_PUBLIC_API_URL', 'http://localhost:4000/api')}/auth/facebook/callback`,
      scope: ['email'],
      profileFields: ['emails', 'name', 'displayName'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { emails, displayName, id } = profile;
    const user = {
      email: emails ? emails[0].value : null,
      name: displayName,
      providerAccountId: id,
      accessToken,
    };
    done(null, user);
  }
}
