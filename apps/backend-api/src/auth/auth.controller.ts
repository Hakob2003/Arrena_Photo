import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile including credits' })
  async getMe(@Req() req) {
    return this.authService.getMe(req.user.id);
  }

  @Get('setup-admin')
  @ApiOperation({ summary: 'Setup initial admin account' })
  async setupAdmin() {
    return this.authService.setupAdmin();
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify email token' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // --- GOOGLE ---
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res) {
    const { access_token } = await this.authService.handleOAuthLogin('google', req.user);
    // Redirect back to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?token=${access_token}`);
  }

  // --- VK ---
  @Get('vk')
  @UseGuards(AuthGuard('vkontakte'))
  async vkAuth() {
    // Redirects to VK
  }

  @Get('vk/callback')
  @UseGuards(AuthGuard('vkontakte'))
  async vkAuthCallback(@Req() req, @Res() res) {
    const { access_token } = await this.authService.handleOAuthLogin('vk', req.user);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?token=${access_token}`);
  }

  // --- FACEBOOK ---
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    // Redirects to Facebook
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(@Req() req, @Res() res) {
    const { access_token } = await this.authService.handleOAuthLogin('facebook', req.user);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?token=${access_token}`);
  }
}
