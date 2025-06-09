import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService],
  exports: [AuthService], // Exporting AuthService to make it available in other modules
})
export class AuthModule {}
