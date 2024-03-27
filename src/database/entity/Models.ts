import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from "typeorm"

@Entity()
export class Personal {

    //Personal o Registro puede tener cualquier número de propiedades adicionales, y que el valor de esas propiedades puede ser de cualquier tipo.
    [key: string]: any;

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    dni: string

    @Column()
    position: string

    @Column()
    dailyEntries: number

    @Column()
    admin: boolean
}

@Entity()
export class Registro {

    //Personal o Registro puede tener cualquier número de propiedades adicionales, y que el valor de esas propiedades puede ser de cualquier tipo.
    [key: string]: any;

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    personal_id: number

    @Column()
    personal_name: string

    @Column()
    date: string;

    @Column()
    time: string;
    
}

@Entity()
export class Auth {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    email: string

    @Column()
    password: string

    @OneToOne(() => Personal)
    @JoinColumn()
    user: Personal
    
}