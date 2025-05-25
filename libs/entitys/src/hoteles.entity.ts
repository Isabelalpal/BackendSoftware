import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuarios } from './usuarios.entity';

@Entity()
export class Hoteles {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    adress: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    city: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    room: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    country: string;

    @ManyToOne(() => Usuarios, (usuario) => usuario.hoteles)
    @JoinColumn({ name: 'manager_id' })
    manager: Usuarios;

    @Column({ type: 'varchar', nullable: true })
    calificacion: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'varchar', nullable: true })
    refreshToken?: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}