import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AppService, TTodo, TTodoWithout } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getListTodo() {
    return this.appService.getList();
  }

  @Get(':id')
  getTodo(@Param('id') id: string) {
    return this.appService.getItem(id);
  }

  @Post()
  createTodo(@Body() body: TTodoWithout) {
    return this.appService.create(body);
  }

  @Put(':id')
  updateTodo(@Param('id') id: string, @Body() body: TTodoWithout) {
    return this.appService.update(id, body);
  }

  @Put(':id/status')
  changeStatus(@Param('id') id: string, @Body() body: TTodo['status']) {
    return this.appService.changeStatus(id, body);
  }

  @Delete(':id')
  deleteTodo(@Param('id') id: string) {
    return this.appService.delete(id);
  }
}
