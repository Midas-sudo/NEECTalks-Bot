#include <stdlib.h>
#include <stdio.h>
#include <string.h>

void readFile();

int main(int argc, char *argv[]){
    readFile(argv[1]);
    return 0;
}

void readFile(char* fileName){
    FILE* fptr;
    FILE* ofptr;
    int time, access, segments, i, j, usercounter, id, token1, token2, token3, buff;
    int * table;
    char date[24];

    fptr = fopen(fileName, "r");
    ofptr = fopen("parsed.csv", "w"); 
    if(fptr==NULL){
        printf("No such file\n");
        return;
    }
    if(ofptr==NULL){
        printf("Cant create output file\n");
        return;
    }

    while(fscanf(fptr, "%*s %d %s %d", &access ,date,&time)==3){
        usercounter=0;
        id=0;
        buff = -1;
        segments = time/30;
        if (time%30!=0){
            segments++;
        }
        
        segments++;

        table = (int*)malloc(segments*sizeof(int));
        for (i = 0; i < segments; i++){
            table[i] = 0;
        }

        for (i = 0; i < access; i++){
            fscanf(fptr, "%d %d %d", &token1 ,&token2 ,&token3);      
           
            if(token2%30>=15){
                token2 = token2/30;
                token2++;
            }else{
                token2 = token2/30;
            }

            if(token3%30>=15){
                token3 = token3/30;
                token3++;
            }else{
                token3 = token3/30;
            }

            if(token1 != id){
                usercounter++;
                id = token1;
            }else{
                if(token2 == buff){
                    token2++;
                }
            }
            for (j = token2; j <= token3 ; j++){
                table[j]++;
            } 
            buff =  token3;          
        }
        
        fprintf(ofptr, "%d,", usercounter);
        /*for (i = 0; i < segments; i++){
            fprintf(ofptr, "%d,", (i+1)*30);
        }*/
        //fprintf(ofptr,"\n");
        for (i = 0; i < segments; i++){
            fprintf(ofptr, "%d,", table[i]);
        }
        fprintf(ofptr,"\n");
        /*for (i = 0; i < segments; i++){
            fprintf(ofptr, "%.2f,", (float)table[i]/usercounter*100);
        }
        fprintf(ofptr,"\n\n");*/
        free(table);
    }
    fclose(fptr);
    fclose(ofptr);
}