import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private users: Repository<User>, private jwt: JwtService) {}
  async register(dto: RegisterDto) {
    if (await this.users.findOne({ where: { email: dto.email } })) throw new ConflictException('Email already registered');
    const user = this.users.create({ fullName: dto.fullName, email: dto.email, passwordHash: await bcrypt.hash(dto.password, 12), role: 'customer' });
    const saved = await this.users.save(user);
    return this.makeToken(saved);
  }
  async login(dto: LoginDto) {
    const user = await this.users.createQueryBuilder('u').addSelect('u.passwordHash').where('u.email = :email', { email: dto.email }).getOne();
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid email or password');
    return this.makeToken(user);
  }
  private async makeToken(user: User) {
    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
    return { accessToken, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } };
  }
}
