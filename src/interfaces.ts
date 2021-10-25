import { DIDDocument } from 'did-resolver';
import Nano from 'nano'

export interface DbDIDDocument extends Nano.MaybeDocument {
    doc: DIDDocument
}