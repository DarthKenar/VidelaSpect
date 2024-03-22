import { Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class Personal {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    dni: string

    @Column()
    position: string

    @Column()
    admin: boolean
}

@Entity()
export class Registro {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    personal_id: number

    @Column()
    personal_name: string

    @Column()
    fecha: string;

    @Column()
    hora: string;
    
}