import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Hoteles } from './hoteles.entity';
import { RolUsuario } from '../enum/rol-usuario.enum';

@Entity()
export class Usuarios {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    first_name: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    middle_name?: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    last_name: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    second_last_name?: string;

    @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
    email: string;

    @Column({ type: 'boolean', default: false })
    isVerified: boolean;

    @Column({ type: 'varchar', nullable: false })
    password: string;

    @Column({ type: 'varchar', length: 15, nullable: true })
    phone?: string;

    @Column({
        type: 'enum',
        enum: RolUsuario,
        default: RolUsuario.USER,
        nullable: false
    })
    role: RolUsuario;

    @Column({ type: 'varchar', nullable: true })
    refreshToken?: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @OneToMany(() => Hoteles, (hotel) => hotel.manager)
    hoteles: Hoteles[];
}