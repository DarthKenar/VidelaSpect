import { Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class Personal {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    Nombre: string

    @Column()
    dni: string

    @Column()
    cargo: string


}

@Entity()
export class PersonalRegistro {
    
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    personal_id: number

    @Column()
    registro_id: number

}

@Entity()
export class Registro {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'date' })
    fecha: Date;

    @Column({ type: 'time' })
    miHora: Date;
    
}