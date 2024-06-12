import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Post,
  ParseIntPipe,
  Body,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from 'src/guard/guard.decorator';
import { ROLE_ENUM } from '@prisma/client';
import { createUserDto, updateParishInfoDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User, UserDecoratorType } from 'src/guard/user.decorator';
import { Christian } from 'src/christian/christian.service';

@Controller('users')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private cloudinary: CloudinaryService,
    private christianService: Christian,
  ) {}

  @Post('/')
  @Roles(ROLE_ENUM.CLERGY)
  async createUser(@Body() userDto: createUserDto) {
    const user = await this.adminService.createUser(userDto);

    return user;
  }

  @Get('/')
  @Roles(ROLE_ENUM.CLERGY, ROLE_ENUM.HIGH_PRIEST)
  async getUsers() {
    const users = await this.adminService.getUsers();
    return users;
  }

  @Delete('/:userId')
  @Roles(ROLE_ENUM.CLERGY)
  async deleteUser(
    @Param('userId', ParseIntPipe)
    userId: number,
  ) {
    const user = await this.adminService.deleteUser(userId);
    return user;
  }

  @Patch('/update-profile-picture')
  @UseInterceptors(FileInterceptor('profilePicture'))
  @Roles('CLERGY', 'HIGH_PRIEST', 'CHRISTIAN')
  async updateProfilePicture(
    @User() user: UserDecoratorType,
    @UploadedFile() profilePicture: Express.Multer.File,
  ) {
    const { url } = await this.cloudinary.uploadImage(profilePicture);
    const updatedUser = await this.adminService.updateUser(user?.id, {
      profilePicture: url,
    });
    return updatedUser;
  }

  @Patch('/update-profile')
  @Roles('CLERGY', 'HIGH_PRIEST', 'CHRISTIAN')
  async updateProfile(
    @User() user: UserDecoratorType,
    @Body()
    data: {
      firstName: string;
      lastName: string;
      email: string;
      telephone: any;
    },
  ) {
    const updatedUser = await this.adminService.updateUser(user?.id, data);
    return updatedUser;
  }

  @Patch('/:userId')
  async updateUser(
    @Param('userId', ParseIntPipe)
    userId: number,
    @Body() data: any,
  ) {
    const user = await this.adminService.updateUser(userId, data);
    return user;
  }

  @Post('/:id/add-new-sacrament')
  @Roles('CLERGY')
  async addNewSacrament(
    @Body() data: { sacrament: string; date: string | Date },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.christianService.addNewMemberSacrament({
      sacrament: data.sacrament,
      date: new Date(data.date),
      userId: id,
    });
  }

  @Post('/parish-info')
  @UseInterceptors(FileInterceptor('signature'))
  @Roles('HIGH_PRIEST')
  async updateParishInfo(
    @Body() data: updateParishInfoDto,
    @UploadedFile() signature: Express.Multer.File,
  ) {
    const { url } = await this.cloudinary.uploadImage(signature);
    return this.adminService.updateParishInfo({
      signature: url,
      parishName: data?.parishName,
      diocese: data?.diocese,
      offeringAmount: data?.offeringAmount,
    });
  }

  @Get('/parishInfo')
  async getParishInfo() {
    return this.adminService.getParishInfo();
  }

  @Get('/offerings')
  async getOfferings(@User() user: UserDecoratorType) {
    return this.adminService.getOfferings({
      christian: {
        userId: user?.id,
      },
    });
  }

  @Put('/offerings/:id')
  async updateOffering(
    @Body() data: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.adminService.updateOffering(data, id);
  }
}
