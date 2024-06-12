import { Controller, Body, Post, HttpCode, Patch } from '@nestjs/common';
import { loginDto, registerDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/guard/guard.decorator';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  async register(@Body() registerInputDto: registerDto) {
    const user = await this.authService.register(registerInputDto);

    return user;
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginInputDto: loginDto) {
    const { user, tokens } =
      await this.authService.loginWithUsernameOrPassword(loginInputDto);
    return {
      user,
      tokens,
    };
  }

  @Post('/activate')
  async activate(@Body() data: any) {
    const user = await this.authService.activateAccount(data.token);
    return user;
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() data: { email: string }) {
    const user = await this.authService.forgotPassword(data.email);
    return user;
  }

  @Post('/reset-password')
  async resetPassword(@Body() data: { token: string; password: string }) {
    const user = await this.authService.resetPassword(
      data.token,
      data.password,
    );
    return user;
  }

  @Patch('/change-password')
  async changePassword(
    @Body() data: { oldPassword: string; newPassword: string; userId: number },
  ) {
    const user = await this.authService.changePassword(
      data.oldPassword,
      data.newPassword,
      data.userId,
    );
    return user;
  }
}
