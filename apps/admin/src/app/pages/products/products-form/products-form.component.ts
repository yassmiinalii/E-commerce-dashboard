import { MessageService } from 'primeng/api';
import { ProductsService, Product } from '@develop/products';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { timer } from 'rxjs';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'admin-products-form',
    templateUrl: './products-form.component.html',
    styles: [],
})
export class ProductsFormComponent implements OnInit {
    form: FormGroup;
    isSubmitted = false;
    editMode = false;
    imageDisplay: string | ArrayBuffer;
    currentProductId: string;

    constructor(
        private location: Location,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private productsServices: ProductsService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
      this._initForm()  
      this._checkEditModel();
      this.currentProductId=this.route.snapshot.paramMap.get('id');
    }

    private _initForm() {
        this.form = this.formBuilder.group({
            name:'',
            price: '',
            description:'...',
            productImage:'',
        });
    }

    onSubmit() {
      this.isSubmitted = true;
      if (this.form.invalid) {
        return;
      }

      const productFormData = new FormData();
      Object.keys(this.productForm).map((key) => {
          productFormData.append(key, this.productForm[key].value);
          console.log(productFormData)
      });


      if (this.editMode) {
        this._updateProduct(productFormData);
      } else {
        this._addProduct(productFormData);
      }
    }
    
    private _addProduct(productData: FormData) {
      this.productsServices.addProduct(productData).subscribe(
        (product: Product) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Product ${product.name} is created!`
          });
          timer(2000)
          .toPromise()
          .then(() => {
            this.location.back();
          });
        },
        () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Product is not created!'
          });
        }
        );
      }
      
      private _updateProduct(productFormData: FormData) {
        this.productsServices.updateProduct(productFormData, this.currentProductId).subscribe(
          () => {
            console.log(this.currentProductId);
            
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Product is updated!'
            });
            timer(2000)
            .toPromise()
            .then(() => {
              this.location.back();
            });
          },
          () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Product is not updated!'
            });
          }
          );
        }

        onImageUpload(event) {
          const file = event.target.files[0];
          if (file) {
            this.form.patchValue({  productImage: file });
            this.form.get(' productImage').updateValueAndValidity();
            const fileReader = new FileReader();
            fileReader.onload = () => {
              this.imageDisplay = fileReader.result;
            };
            fileReader.readAsDataURL(file);
          }
        } 

        private _checkEditModel() {
          this.route.params.subscribe((params) => {
            if (params.id) {
              this.editMode = true;
              //this.currentProductId = params.id;
              this.productsServices.getProduct(params.id).subscribe((product) => {
                this.productForm.name.setValue(product.name);
                this.productForm.price.setValue(product.price);
                this.productForm. description.setValue(product. description);
                this.imageDisplay = product.productImage;
                this.productForm.productImage.setValidators([]);
                this.productForm.productImage.updateValueAndValidity();
              });
            }
          });
        }
        
        get productForm() {
          return this.form.controls;
        }

        onCancel(){
          this.location.back(); 
        }
      }
      